import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const imageScale = 32;

interface TechRow {
    id: string;
    name: string;
    description: string;
    cost_gold: string;
    cost_gems: string;
    cost_lumber: string;
    cost_stone: string;
    cost_researchPoints: string;
    effect_types: string;
    effect_amounts: string;
    effect_facilityIds: string;
    requirement_types: string;
    requirement_ids: string;
    requirement_levels: string;
    icon_path: string;
    repeatable: string;
    costMultiplier: string;
    maxLevel: string;
}

function splitAndTrim(value: string): string[] {
    return value.split('|').map(v => v.trim()).filter(v => v !== '');
}

function convertCsvToTechs(csvPath: string): string {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    }) as TechRow[];

    const techs = records.map(record => {
        // Split effect arrays
        const effectTypes = splitAndTrim(record.effect_types);
        const effectAmounts = splitAndTrim(record.effect_amounts);
        const effectFacilityIds = splitAndTrim(record.effect_facilityIds);

        // Create effects array
        const effects = effectTypes.map((type, index) => ({
            type,
            amount: parseFloat(effectAmounts[index] || '1'),
            facilityId: effectFacilityIds[index] || effectFacilityIds[0] // Fallback to first facility if not specified
        }));

        // Split requirement arrays
        const requirementTypes = splitAndTrim(record.requirement_types);
        const requirementIds = splitAndTrim(record.requirement_ids);
        const requirementLevels = splitAndTrim(record.requirement_levels);

        // Create requirements array
        const requirements = requirementTypes.map((type, index) => ({
            type,
            id: requirementIds[index],
            level: parseInt(requirementLevels[index] || '1')
        }));

        const tech = {
            id: record.id,
            name: record.name,
            description: record.description,
            cost: {
                resources: {
                    gold: parseInt(record.cost_gold) || null,
                    gems: parseInt(record.cost_gems) || null,
                    lumber: parseInt(record.cost_lumber) || null,
                    stone: parseInt(record.cost_stone) || null,
                },
                researchPoints: parseInt(record.cost_researchPoints) || null,
            },
            effects,
            requirements,
            icon: `<Image src={"/${record.icon_path}"} alt="${record.name}" width={${imageScale}} height={${imageScale}} />`,
            iconBig: `<Image src={"/${record.icon_path}"} alt="${record.name}" width={${4*imageScale}} height={${4*imageScale}} />`,
            repeatable: record.repeatable === 'true',
            costMultiplier: parseFloat(record.costMultiplier),
            maxLevel: parseInt(record.maxLevel),
            level: 0
        };

        return tech;
    });

    // Generate the TypeScript code
    const techsCode = `import Image from "next/image";

const imageScale = ${imageScale};

export interface Tech {
    id: string;
    name: string;
    description: string;
    cost: {
        resources: {
            [key: string]: number | null;
        } | null;
        researchPoints: number | null;
    };
    effects: {
        type: string;
        amount: number;
        facilityId: string;
    }[]; // effects of the tech
    requirements: {
        type: string;
        id: string;
        level: number;
    }[]; // requirements of the tech
    icon: React.ReactNode; // icon of the tech
    iconBig: React.ReactNode; // big icon of the tech
    repeatable?: boolean; // whether the tech can be researched multiple times
    costMultiplier?: number; // multiplier for the cost of the tech
    maxLevel?: number; // maximum level for repeatable techs
    level?: number; // current level of the tech
}

export const techs: { [key: string]: Tech } = ${JSON.stringify(techs, null, 4)
    .replace(/"<Image/g, '<Image')
    .replace(/\/>"}/g, '/>}')};
`;

    return techsCode;
}

// Convert the CSV file
const csvPath = path.join(__dirname, './tech_template.csv');
const outputPath = path.join(__dirname, '../src/app/data/techs.tsx');
const techsCode = convertCsvToTechs(csvPath);
fs.writeFileSync(outputPath, techsCode); 