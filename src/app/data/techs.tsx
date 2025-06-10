import Image from "next/image";

const imageScale = 32;

// Helper function to handle image paths
const getImagePath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

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

export const techs: { [key: string]: Tech } = {
    "tech_mining_1": {
        id: "tech_mining_1",
        name: "Mining Tech 1",
        description: "Increases mining production by 50%",
        cost: {
            resources: {
                gold: 100,
                gems: 100,
                lumber: null,
                stone: null
            },
            researchPoints: 100
        },
        effects: [
            {
                type: "production",
                amount: 1.5,
                facilityId: "mine"
            }
        ],
        requirements: [],
        icon: <Image src={getImagePath("images/techs/icon_tech_mining_1.png")} alt="Mining Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/techs/icon_tech_mining_1.png")} alt="Mining Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_mining_2": {
        id: "tech_mining_2",
        name: "Mining Tech 2",
        description: "Increases mining production by 100%",
        cost: {
            resources: {
                gold: 200,
                gems: 200,
                lumber: null,
                stone: null
            },
            researchPoints: 200
        },
        effects: [
            {
                type: "production",
                amount: 2,
                facilityId: "mine"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_mining_1",
                level: 5
            }
        ],
        icon: <Image src={getImagePath("images/techs/icon_tech_mining_2.png")} alt="Mining Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={getImagePath("images/techs/icon_tech_mining_2.png")} alt="Mining Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    },
    "tech_lumber_1": {
        id: "tech_lumber_1",
        name: "Lumber Tech 1",
        description: "Increases lumber production by 50%",
        cost: {
            resources: {
                gold: 100,
                gems: 100,
                lumber: null,
                stone: null
            },
            researchPoints: 100
        },
        effects: [
            {
                type: "production",
                amount: 1.5,
                facilityId: "lumberMill"
            }
        ],
        requirements: [],
        icon: <Image src={"/images/techs/icon_tech_lumber_1.png"} alt="Lumber Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_lumber_1.png"} alt="Lumber Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_lumber_2": {
        id: "tech_lumber_2",
        name: "Lumber Tech 2",
        description: "Increases lumber production by 100%",
        cost: {
            resources: {
                gold: 200,
                gems: 200,
                lumber: null,
                stone: null
            },
            researchPoints: 200
        },
        effects: [
            {
                type: "production",
                amount: 2,
                facilityId: "lumberMill"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_lumber_1",
                level: 5
            }
        ],
        icon: <Image src={"/images/techs/icon_tech_lumber_2.png"} alt="Lumber Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_lumber_2.png"} alt="Lumber Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    },
    "tech_quarry_1": {
        id: "tech_quarry_1",
        name: "Quarry Tech 1",
        description: "Increases stone production by 50%",
        cost: {
            resources: {
                gold: 100,
                gems: 100,
                lumber: null,
                stone: null
            },
            researchPoints: 100
        },
        effects: [
            {
                type: "production",
                amount: 1.5,
                facilityId: "quarry"
            }
        ],
        requirements: [],
        icon: <Image src={"/images/techs/icon_tech_quarry_1.png"} alt="Quarry Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_quarry_1.png"} alt="Quarry Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_quarry_2": {
        id: "tech_quarry_2",
        name: "Quarry Tech 2",
        description: "Increases stone production by 100%",
        cost: {
            resources: {
                gold: 200,
                gems: 200,
                lumber: null,
                stone: null
            },
            researchPoints: 200
        },
        effects: [
            {
                type: "production",
                amount: 2,
                facilityId: "quarry"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_quarry_1",
                level: 5
            }
        ],
        icon: <Image src={"/images/techs/icon_tech_quarry_2.png"} alt="Quarry Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_quarry_2.png"} alt="Quarry Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    },
    "tech_research_1": {
        id: "tech_research_1",
        name: "Research Tech 1",
        description: "Increases research point generation by 50%",
        cost: {
            resources: {
                gold: 150,
                gems: 150,
                lumber: null,
                stone: null
            },
            researchPoints: 150
        },
        effects: [
            {
                type: "production",
                amount: 1.5,
                facilityId: "library"
            }
        ],
        requirements: [],
        icon: <Image src={"/images/techs/icon_tech_library_1.png"} alt="Research Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_library_1.png"} alt="Research Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_research_2": {
        id: "tech_research_2",
        name: "Research Tech 2",
        description: "Increases research point generation by 100%",
        cost: {
            resources: {
                gold: 300,
                gems: 300,
                lumber: null,
                stone: null
            },
            researchPoints: 300
        },
        effects: [
            {
                type: "production",
                amount: 2,
                facilityId: "library"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_research_1",
                level: 5
            }
        ],
        icon: <Image src={"/images/techs/icon_tech_library_2.png"} alt="Research Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_library_2.png"} alt="Research Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    },
    "tech_military_1": {
        id: "tech_military_1",
        name: "Military Tech 1",
        description: "Increases unit capacity by 50%",
        cost: {
            resources: {
                gold: 200,
                gems: 200,
                lumber: null,
                stone: null
            },
            researchPoints: 200
        },
        effects: [
            {
                type: "capacity",
                amount: 1.5,
                facilityId: "barracks"
            }
        ],
        requirements: [],
        icon: <Image src={"/images/techs/icon_tech_barracks_1.png"} alt="Military Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_barracks_1.png"} alt="Military Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_military_2": {
        id: "tech_military_2",
        name: "Military Tech 2",
        description: "Increases unit capacity by 100%",
        cost: {
            resources: {
                gold: 400,
                gems: 400,
                lumber: null,
                stone: null
            },
            researchPoints: 400
        },
        effects: [
            {
                type: "capacity",
                amount: 2,
                facilityId: "barracks"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_military_1",
                level: 5
            }
        ],
        icon: <Image src={"/images/techs/icon_tech_barracks_2.png"} alt="Military Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_barracks_2.png"} alt="Military Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    },
    "tech_housing_1": {
        id: "tech_housing_1",
        name: "Housing Tech 1",
        description: "Increases population capacity by 50%",
        cost: {
            resources: {
                gold: 50,
                gems: 50,
                lumber: null,
                stone: null
            },
            researchPoints: 50
        },
        effects: [
            {
                type: "capacity",
                amount: 1.5,
                facilityId: "housing"
            }
        ],
        requirements: [],
        icon: <Image src={"/images/techs/icon_tech_housing_1.png"} alt="Housing Tech 1" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_housing_1.png"} alt="Housing Tech 1" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 1.5,
        maxLevel: 10,
        level: 0
    },
    "tech_housing_2": {
        id: "tech_housing_2",
        name: "Housing Tech 2",
        description: "Increases population capacity by 100%",
        cost: {
            resources: {
                gold: 100,
                gems: 100,
                lumber: null,
                stone: null
            },
            researchPoints: 100
        },
        effects: [
            {
                type: "capacity",
                amount: 2,
                facilityId: "housing"
            }
        ],
        requirements: [
            {
                type: "tech",
                id: "tech_housing_1",
                level: 5
            }
        ],
        icon: <Image src={"/images/techs/icon_tech_housing_2.png"} alt="Housing Tech 2" width={imageScale} height={imageScale} />,
        iconBig: <Image src={"/images/techs/icon_tech_housing_2.png"} alt="Housing Tech 2" width={imageScale * 4} height={imageScale * 4} />,
        repeatable: true,
        costMultiplier: 2,
        maxLevel: 10,
        level: 0
    }
};
