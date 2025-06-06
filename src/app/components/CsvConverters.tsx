import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import Image from 'next/image';
import { Facility } from '../data/facilities';

const imageScale = 32;

interface Tech {
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
    }[];
    requirements: {
        type: string;
        id: string;
        level: number;
    }[];
    icon: React.ReactNode;
    iconBig: React.ReactNode;
    repeatable?: boolean;
    costMultiplier?: number;
    maxLevel?: number;
    level?: number;
}

interface CsvRecord {
    [key: string]: string;
}

export function convertCsvToData<T extends { id: string }>(
    csvPath: string,
    converter: (record: CsvRecord) => T
): { [key: string]: T } {
    try {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        }) as CsvRecord[];

        return records.reduce((acc, record) => {
            const converted = converter(record);
            if (converted && 'id' in converted) {
                acc[converted.id] = converted;
            }
            return acc;
        }, {} as { [key: string]: T });
    } catch (error) {
        console.error(`Error converting CSV file ${csvPath}:`, error);
        return {};
    }
}

export function convertFacilitiesCsv(csvPath: string): { [key: string]: Facility } {
    const splitAndTrim = (value: string): string[] => {
        return value.split('|').map(v => v.trim()).filter(v => v !== '');
    };

    const parseResourcePairs = (value: string): { [key: string]: number } => {
        if (!value) return {};
        const pairs = splitAndTrim(value);
        return pairs.reduce((acc, pair) => {
            const [resource, amount] = pair.split(':').map(s => s.trim());
            if (resource && amount) {
                acc[resource] = parseInt(amount);
            }
            return acc;
        }, {} as { [key: string]: number });
    };

    const parseRequirementPairs = (value: string): { id: string; level: number }[] => {
        if (!value) return [];
        const pairs = splitAndTrim(value);
        return pairs.map(pair => {
            const [id, level] = pair.split(':').map(s => s.trim());
            return {
                id,
                level: parseInt(level) || 1
            };
        });
    };

    return convertCsvToData<Facility>(csvPath, (record) => {
        const baseCost = {
            gold: parseInt(record.base_gold),
            gems: parseInt(record.base_gems),
            resources: parseResourcePairs(record.base_resources)
        };

        const baseProduction = record.production_type ? {
            type: record.production_type as 'resource' | 'population' | 'research' | 'crafting',
            amount: parseFloat(record.production_amount),
            resourceType: record.production_resource,
            interval: parseInt(record.production_interval)
        } : undefined;

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

        return {
            id: record.id,
            name: record.name,
            description: record.description,
            category: record.category as Facility['category'],
            baseCost,
            constructionTime: parseInt(record.construction_time),
            maxLevel: parseInt(record.max_level),
            repeatable: record.repeatable.toLowerCase() === 'true',
            baseProduction,
            baseCapacity: record.base_capacity ? parseInt(record.base_capacity) : undefined,
            baseEfficiency: record.base_efficiency ? parseFloat(record.base_efficiency) : undefined,
            upgrades: [],
            requirements: Object.keys(requirements).length > 0 ? requirements : undefined,
            icon: <Image src={`/${record.icon_path}`} alt={record.name} width={imageScale} height={imageScale} />,
            iconBig: <Image src={`/${record.icon_path}`} alt={record.name} width={imageScale*4} height={imageScale*4} />
        };
    });
}

export function convertTechsCsv(csvPath: string): { [key: string]: Tech } {
    const splitAndTrim = (value: string): string[] => {
        return value.split('|').map(v => v.trim()).filter(v => v !== '');
    };

    return convertCsvToData<Tech>(csvPath, (record) => {
        const effectTypes = splitAndTrim(record.effect_types);
        const effectAmounts = splitAndTrim(record.effect_amounts);
        const effectFacilityIds = splitAndTrim(record.effect_facilityIds);

        const effects = effectTypes.map((type, index) => ({
            type,
            amount: parseFloat(effectAmounts[index] || '1'),
            facilityId: effectFacilityIds[index] || effectFacilityIds[0]
        }));

        const requirementTypes = splitAndTrim(record.requirement_types);
        const requirementIds = splitAndTrim(record.requirement_ids);
        const requirementLevels = splitAndTrim(record.requirement_levels);

        const requirements = requirementTypes.map((type, index) => ({
            type,
            id: requirementIds[index],
            level: parseInt(requirementLevels[index] || '1')
        }));

        return {
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
            icon: <Image src={`/${record.icon_path}`} alt={record.name} width={imageScale} height={imageScale} />,
            iconBig: <Image src={`/${record.icon_path}`} alt={record.name} width={imageScale*4} height={imageScale*4} />,
            repeatable: record.repeatable === 'true',
            costMultiplier: parseFloat(record.costMultiplier),
            maxLevel: parseInt(record.maxLevel),
            level: 0
        };
    });
} 