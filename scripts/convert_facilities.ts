import fs from 'fs';
import { parse } from 'csv-parse/sync';
import Image from 'next/image';

const imageScale = 32;

interface FacilityRow {
    id: string;
    name: string;
    description: string;
    category: 'production' | 'research' | 'military' | 'infrastructure' | 'special';
    base_gold: string;
    base_gems: string;
    base_resources: string; // Format: "resource1:amount1|resource2:amount2"
    construction_time: string;
    max_level: string;
    repeatable: string;
    production_type: string;
    production_amount: string;
    production_resource: string;
    production_interval: string;
    base_capacity: string;
    base_efficiency: string;
    req_population: string;
    req_facilities: string; // Format: "facility1:level1|facility2:level2"
    req_research: string; // Format: "tech1:level1|tech2:level2"
    icon_path: string;
}

function splitAndTrim(value: string): string[] {
    return value.split('|').map(v => v.trim()).filter(v => v !== '');
}

function parseResourcePairs(value: string): { [key: string]: number } {
    if (!value) return {};
    const pairs = splitAndTrim(value);
    return pairs.reduce((acc, pair) => {
        const [resource, amount] = pair.split(':').map(s => s.trim());
        if (resource && amount) {
            acc[resource] = parseInt(amount);
        }
        return acc;
    }, {} as { [key: string]: number });
}

function parseRequirementPairs(value: string): { id: string; level: number }[] {
    if (!value) return [];
    const pairs = splitAndTrim(value);
    return pairs.map(pair => {
        const [id, level] = pair.split(':').map(s => s.trim());
        return {
            id,
            level: parseInt(level) || 1
        };
    });
}

function convertCsvToFacilities(csvPath: string): string {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    }) as FacilityRow[];

    const facilities = records.map(record => {
        // Create base cost object with parsed resources
        const baseCost = {
            gold: parseInt(record.base_gold),
            gems: parseInt(record.base_gems),
            resources: parseResourcePairs(record.base_resources)
        };

        // Create base production if specified
        const baseProduction = record.production_type ? {
            type: record.production_type as 'resource' | 'population' | 'research' | 'crafting',
            amount: parseFloat(record.production_amount),
            resourceType: record.production_resource,
            interval: parseInt(record.production_interval)
        } : undefined;

        // Create requirements object with parsed facility and research requirements
        const facilityReqs = parseRequirementPairs(record.req_facilities);
        const researchReqs = parseRequirementPairs(record.req_research);
        
        const requirements = {
            ...(parseInt(record.req_population) > 0 ? { population: parseInt(record.req_population) } : {}),
            ...(facilityReqs.length > 0 ? { 
                facilities: facilityReqs.map(req => req.id),
                facilityLevels: Object.fromEntries(facilityReqs.map(req => [req.id, req.level]))
            } : {}),
            ...(researchReqs.length > 0 ? { 
                research: researchReqs.map(req => req.id),
                researchLevels: Object.fromEntries(researchReqs.map(req => [req.id, req.level]))
            } : {})
        };

        // Create the facility object
        return {
            id: record.id,
            name: record.name,
            description: record.description,
            category: record.category,
            baseCost,
            constructionTime: parseInt(record.construction_time),
            maxLevel: parseInt(record.max_level),
            repeatable: record.repeatable.toLowerCase() === 'true',
            baseProduction,
            baseCapacity: record.base_capacity ? parseInt(record.base_capacity) : undefined,
            baseEfficiency: record.base_efficiency ? parseFloat(record.base_efficiency) : undefined,
            upgrades: [], // Empty array since upgrades are handled by repeatable system
            requirements: Object.keys(requirements).length > 0 ? requirements : undefined,
            icon: `<Image src={"/${record.icon_path}"} alt="${record.name}" width={${imageScale}} height={${imageScale}} />`,
            iconBig: `<Image src={"/${record.icon_path}"} alt="${record.name}" width={${4*imageScale}} height={${4*imageScale}} />`
        };
    });

    // Generate the TypeScript code
    const code = `import Image from "next/image";

const imageScale = 32;

export interface FacilityCost {
    gold: number;
    gems: number;
    resources?: {
        [key: string]: number;
    };
    constructionTime?: number;
    requirements?: {
        [key: string]: number;
    };
}

export interface FacilityProduction {
    type: 'resource' | 'population' | 'research' | 'crafting';
    amount: number;
    resourceType?: string;
    interval: number; // in turns
}

export interface FacilityUpgrade {
    level: number;
    cost: FacilityCost;
    constructionTime: number; // in turns
    effects: {
        production?: Partial<FacilityProduction>;
        capacity?: number;
        efficiency?: number;
        unlocks?: string[];
    };
}

export interface Facility {
    id: string;
    name: string;
    description: string;
    category: 'production' | 'research' | 'military' | 'infrastructure' | 'special';
    baseCost: FacilityCost;
    constructionTime: number;
    maxLevel: number;
    repeatable: boolean;
    baseProduction?: FacilityProduction;
    baseCapacity?: number;
    baseEfficiency?: number;
    upgrades: FacilityUpgrade[];
    requirements?: {
        facilities?: string[];
        facilityLevels?: { [key: string]: number };
        research?: string[];
        researchLevels?: { [key: string]: number };
        population?: number;
    };
    specialEffects?: {
        [key: string]: any;
    };
    icon: React.ReactNode;
    iconBig: React.ReactNode;
}

// Helper function to calculate upgrade costs
export const calculateUpgradeCost = (facility: Facility, currentLevel: number): FacilityCost => {
    if (!facility.repeatable) {
        return facility.upgrades[currentLevel]?.cost || facility.baseCost;
    }

    // For repeatable facilities, increase costs by 50% per level
    const multiplier = Math.pow(1.5, currentLevel);
    return {
        gold: Math.floor(facility.baseCost.gold * multiplier),
        gems: Math.floor(facility.baseCost.gems * multiplier),
        resources: facility.baseCost.resources ? 
            Object.fromEntries(
                Object.entries(facility.baseCost.resources)
                    .map(([key, value]) => [key, Math.floor(value * multiplier)])
            ) : undefined,
        constructionTime: Math.floor(facility.constructionTime * multiplier),
        requirements: facility.baseCost.requirements ?
            Object.fromEntries(
                Object.entries(facility.baseCost.requirements)
                    .map(([key, value]) => [key, Math.floor(value * multiplier)])
            ) : undefined,
    };
};

export const facilities: { [key: string]: Facility } = {
${facilities.map(f => `    "${f.id}": ${JSON.stringify(f, null, 8)}`).join(',\n')}
};`;

    return code;
}

// Convert the CSV file
const csvPath = 'scripts/facilities_template.csv';
const outputPath = 'src/app/data/facilities.tsx';

try {
    const code = convertCsvToFacilities(csvPath);
    fs.writeFileSync(outputPath, code);
    console.log(`Successfully converted ${csvPath} to ${outputPath}`);
} catch (error) {
    console.error('Error converting facilities:', error);
} 