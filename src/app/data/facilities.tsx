import Image from "next/image";

const imageScale = 32;

// Helper function to handle image paths
const getImagePath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

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
    category: 'production' | 'research' | 'military' | 'infrastructure' | 'special' | 'population' | 'crafting';
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
    "mine": {
        id: "mine",
        name: "Mine",
        description: "Extracts valuable resources from the mountain. Each level increases gold production.",
        category: "production",
        baseCost: {
            gold: 100,
            gems: 0,
            resources: {
                lumber: 50,
                stone: 100
            }
        },
        constructionTime: 2,
        maxLevel: 50,
        repeatable: true,
        baseProduction: {
            type: "resource",
            amount: 20,
            resourceType: "gold",
            interval: 1
        },
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 5
        },
        icon: <Image src={getImagePath("images/facilities/icon_mine.png")} alt="Mine" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_mine.png")} alt="Mine" width={imageScale*4} height={imageScale*4} />
    },
    "lumberMill": {
        id: "lumberMill",
        name: "Lumber Mill",
        description: "Processes wood into lumber. Each level increases lumber production.",
        category: "production",
        baseCost: {
            gold: 100,
            gems: 0,
            resources: {
                lumber: 50,
                stone: 100
            }
        },
        constructionTime: 2,
        maxLevel: 50,
        repeatable: true,
        baseProduction: {
            type: "resource",
            amount: 20,
            resourceType: "lumber",
            interval: 1
        },
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 1
        },
        icon: <Image src={getImagePath("images/facilities/icon_sawmill.png")} alt="Lumber Mill" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_sawmill.png")} alt="Lumber Mill" width={imageScale*4} height={imageScale*4} />
    },
    "quarry": {
        id: "quarry",
        name: "Quarry",
        description: "Extracts stone from the mountain. Each level increases stone production.",
        category: "production",
        baseCost: {
            gold: 100,
            gems: 0,
            resources: {
                stone: 50,
                lumber: 100
            }
        },
        constructionTime: 2,
        maxLevel: 50,
        repeatable: true,
        baseProduction: {
            type: "resource",
            amount: 20,
            resourceType: "stone",
            interval: 1
        },
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 1
        },
        icon: <Image src={getImagePath("images/facilities/icon_quarry.png")} alt="Quarry" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_quarry.png")} alt="Quarry" width={imageScale*4} height={imageScale*4} />
    },
    "library": {
        id: "library",
        name: "Library",
        description: "Research new technologies and improvements. Each level increases research output.",
        category: "research",
        baseCost: {
            gold: 150,
            gems: 0,
            resources: {
                lumber: 100,
                stone: 50
            }
        },
        constructionTime: 5,
        maxLevel: 50,
        repeatable: true,
        baseProduction: {
            type: "resource",
            amount: 1,
            resourceType: "researchPoints",
            interval: 1
        },
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 3
        },
        icon: <Image src={getImagePath("images/facilities/icon_library.png")} alt="Library" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_library.png")} alt="Library" width={imageScale*4} height={imageScale*4} />
    },
    "barracks": {
        id: "barracks",
        name: "Barracks",
        description: "Train and equip military units. Each level increases unit capacity.",
        category: "military",
        baseCost: {
            gold: 200,
            gems: 0,
            resources: {
                lumber: 150,
                stone: 200
            }
        },
        constructionTime: 7,
        maxLevel: 4,
        repeatable: false,
        baseCapacity: 5,
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 10,
            facilities: [
                "library"
            ],
            facilityLevels: {
                library: 2
            },
            research: [
                "tech_military_1"
            ],
            researchLevels: {
                tech_military_1: 1
            }
        },
        icon: <Image src={getImagePath("images/facilities/icon_barracks.png")} alt="Barracks" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_barracks.png")} alt="Barracks" width={imageScale*4} height={imageScale*4} />
    },
    "housing": {
        id: "housing",
        name: "Housing",
        description: "Provides living space for your population. Each level increases population capacity.",
        category: "population",
        baseCost: {
            gold: 50,
            gems: 0,
            resources: {
                lumber: 100
            }
        },
        constructionTime: 2,
        maxLevel: 50,
        repeatable: true,
        baseCapacity: 10,
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 1
        },
        icon: <Image src={getImagePath("images/facilities/icon_housing.png")} alt="Housing" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_housing.png")} alt="Housing" width={imageScale*4} height={imageScale*4} />
    },
    "forge": {
        id: "forge",
        name: "Forge",
        description: "Crafts equipment. Each level increases crafting output.",
        category: "crafting",
        baseCost: {
            gold: 100,
            gems: 0,
            resources: {
                lumber: 100,
                stone: 100
            }
        },
        constructionTime: 4,
        maxLevel: 50,
        repeatable: true,
        baseProduction: {
            type: "resource",
            amount: 1,
            resourceType: "equipment",
            interval: 1
        },
        baseEfficiency: 1,
        upgrades: [],
        requirements: {
            population: 1,
            research: [
                "tech_crafting_1"
            ],
            researchLevels: {
                tech_crafting_1: 1
            }
        },
        icon: <Image src={getImagePath("images/facilities/icon_forge.png")} alt="Forge" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/facilities/icon_forge.png")} alt="Forge" width={imageScale*4} height={imageScale*4} />
    }
};