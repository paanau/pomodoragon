import { facilities, Facility, calculateUpgradeCost } from '../data/facilities';
import { techs } from '../data/techs';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import Image from 'next/image';

const imageScale = 32;

interface GameFacility {
  id: string;
  level: number;
  constructionProgress: number;
  isConstructing: boolean;
  productionProgress?: number;
  icon: React.ReactNode;
}

interface SocietyFocus {
  growth: number;
  production: number;
  research: number;
  exploration: number;
  trade: number;
}

interface GameFacilities {
  [key: string]: GameFacility;
}

interface UnlockedTechs {
  [key: string]: number;
}

interface GameResources {
  totalGold: number;
  totalGems: number;
  totalLumber: number;
  totalStone: number;
  totalPopulation: number;
  totalSoldiers: number;
  researchPoints: number;
}

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

export const calculateResourceIncome = (
  resourceType: string,
  gameFacilities: GameFacilities,
  societyFocus: SocietyFocus,
  unlockedTechs: UnlockedTechs
): number => {
  return Object.entries(gameFacilities).reduce((total, [id, facility]) => {
    const facilityData = facilities[id];
    if (!facilityData?.baseProduction || 
        facilityData.baseProduction.type !== 'resource' || 
        facilityData.baseProduction.resourceType !== resourceType ||
        facility.isConstructing) {
      return total;
    }

    // Calculate base amount
    let amount = facilityData.baseProduction.amount * 
      (facilityData.baseEfficiency || 1) * 
      facility.level;

    // Apply tech bonuses
    Object.entries(unlockedTechs).forEach(([techId, level]) => {
      const tech = techs[techId];
      if (!tech || !tech.effects) return;

      tech.effects.forEach(effect => {
        if (effect.type === 'production' && effect.facilityId === id) {
          // Each level of the tech adds its bonus
          amount *= Math.pow(effect.amount, level);
        }
      });
    });

    // Apply society focus multiplier
    if (resourceType === 'researchPoints') {
      amount *= societyFocus.research;
    } else {
      amount *= societyFocus.production;
    }

    return total + (amount / facilityData.baseProduction.interval);
  }, 0);
};

export const calculateAllResourceIncome = (
  gameFacilities: GameFacilities,
  societyFocus: SocietyFocus,
  unlockedTechs: UnlockedTechs
) => {
  const goldIncome = calculateResourceIncome('gold', gameFacilities, societyFocus, unlockedTechs);
  const gemsIncome = calculateResourceIncome('gems', gameFacilities, societyFocus, unlockedTechs);
  const lumberIncome = calculateResourceIncome('lumber', gameFacilities, societyFocus, unlockedTechs);
  const stoneIncome = calculateResourceIncome('stone', gameFacilities, societyFocus, unlockedTechs);
  const researchPointsIncome = calculateResourceIncome('researchPoints', gameFacilities, societyFocus, unlockedTechs);
  
  return {
    gold: goldIncome,
    gems: gemsIncome,
    lumber: lumberIncome,
    stone: stoneIncome,
    researchPoints: researchPointsIncome
  };
};

export const calculatePopulationMax = (
  housingLevel: number
): number => {
  const housingFacility = facilities["housing"];
  if (!housingFacility || !housingFacility.baseCapacity) return 0;
  return housingLevel * housingFacility.baseCapacity;
};

export const calculatePopulationGrowth = (
  currentPopulation: number,
  maxPopulation: number,
  growthFocus: number
): number => {
  return Math.min(growthFocus, maxPopulation - currentPopulation);
};

export const formatTime = (timeLeft: number): string => {
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateProgress = (current: number, total: number): number => {
  return (current / total) * 100;
};

export const calculateCircumference = (radius: number): number => {
  return 2 * Math.PI * radius;
};

export const calculateStrokeDashoffset = (circumference: number, progress: number): number => {
  return circumference - (progress / 100) * circumference;
};

export const calculateConstructionProgress = (
  facility: GameFacility,
  facilityData: Facility,
  newState: { gameInfo: { facilities: GameFacilities } }
): void => {
  if (!facility.isConstructing) return;

  let constructionTime: number;
  
  if (facility.level === 0) {
    // Initial construction
    constructionTime = facilityData.constructionTime;
  } else if (facilityData.repeatable) {
    // For repeatable facilities, get construction time from upgrade cost
    const upgradeCost = calculateUpgradeCost(facilityData, facility.level);
    constructionTime = Math.ceil(upgradeCost.constructionTime || 0);
  } else if (facility.level < facilityData.maxLevel && facilityData.upgrades) {
    // For non-repeatable facilities, use the next upgrade's construction time
    const nextUpgrade = facilityData.upgrades[facility.level - 1];
    if (!nextUpgrade) return; // Skip if no upgrade available
    constructionTime = nextUpgrade.constructionTime;
  } else {
    return; // Skip if at max level and not repeatable
  }

  const facilityState = newState.gameInfo.facilities[facility.id];
  if (!facilityState) return;

  // Update construction progress
  facilityState.constructionProgress += 1;
  
  if (facilityState.constructionProgress >= constructionTime) {
    facilityState.isConstructing = false;
    facilityState.constructionProgress = 0;
    // Only increment level when construction is complete
    if (facilityState.level === 0) {
      facilityState.level = 1;
    } else {
      facilityState.level += 1;
    }
  }
};

export const calculateFacilityProduction = (
  facility: GameFacility,
  facilityData: Facility,
  societyFocus: SocietyFocus,
  unlockedTechs: UnlockedTechs,
  newState: { 
    gameInfo: { 
      facilities: GameFacilities, 
      resources: {
        totalGold: number;
        totalLumber: number;
        totalStone: number;
        researchPoints: number;
      }
    } 
  }
): void => {
  if (!facilityData.baseProduction) return;

  const facilityState = newState.gameInfo.facilities[facility.id];
  if (!facilityState) return;

  facilityState.productionProgress = (facility.productionProgress || 0) + 1;
  if (facilityState.productionProgress >= facilityData.baseProduction.interval) {
    facilityState.productionProgress = 0;
    
    // Apply production effects
    if (facilityData.baseProduction.type === 'resource' && facilityData.baseProduction.resourceType) {
      // Calculate base amount
      let amount = facilityData.baseProduction.amount * 
        (facilityData.baseEfficiency || 1) * 
        facility.level;

      // Apply tech bonuses
      Object.entries(unlockedTechs).forEach(([techId, level]) => {
        const tech = techs[techId];
        if (!tech || !tech.effects) return;

        tech.effects.forEach(effect => {
          if (effect.type === 'production' && effect.facilityId === facility.id) {
            // Each level of the tech adds its bonus
            amount *= Math.pow(effect.amount, level);
          }
        });
      });

      // Apply society focus multiplier
      if (facilityData.baseProduction.resourceType === 'researchPoints') {
        amount *= societyFocus.research;
      } else {
        amount *= societyFocus.production;
      }

      // Apply the production
      if (facilityData.baseProduction.resourceType === 'gold') {
        newState.gameInfo.resources.totalGold += amount;
      } else if (facilityData.baseProduction.resourceType === 'lumber') {
        newState.gameInfo.resources.totalLumber += amount;
      } else if (facilityData.baseProduction.resourceType === 'stone') {
        newState.gameInfo.resources.totalStone += amount;
      } else if (facilityData.baseProduction.resourceType === 'researchPoints') {
        newState.gameInfo.resources.researchPoints += amount;
      }
    }
  }
};

export const canResearchTech = (
  techId: string,
  currentLevel: number,
  resources: GameResources,
  unlockedTechs: UnlockedTechs,
  gameFacilities: GameFacilities
): boolean => {
  const tech = techs[techId];
  if (!tech) return false;

  // Check if tech is at max level
  if (tech.maxLevel && tech.maxLevel !== 0 && currentLevel >= tech.maxLevel) return false;

  // Check if we can afford the research
  const costMultiplier = tech.costMultiplier ? tech.costMultiplier : 1;
  const researchCost = tech.cost.researchPoints ? tech.cost.researchPoints * costMultiplier : 0;
  if (resources.researchPoints < researchCost) return false;

  // Check requirements
  if (tech.requirements) {
    for (const req of tech.requirements) {
      if (req.type === 'tech') {
        const requiredLevel = unlockedTechs[req.id] || 0;
        if (requiredLevel < (req.level || 1)) return false;
      }
      else if (req.type === 'facility') {
        const requiredLevel = gameFacilities[req.id]?.level || 0;
        if (requiredLevel < (req.level || 1)) return false;
      }
    }
  }

  // Check resource requirements
  if (tech.cost.resources) {
    for (const [resource, amount] of Object.entries(tech.cost.resources)) {
      if (amount && amount > resources[resource as keyof GameResources]) return false;
    }
  }

  return true;
};

export const applyResearchTech = (
  techId: string,
  currentLevel: number,
  resources: GameResources,
  unlockedTechs: UnlockedTechs
): { newResources: GameResources, newUnlockedTechs: UnlockedTechs } => {
  const tech = techs[techId];
  if (!tech) return { newResources: resources, newUnlockedTechs: unlockedTechs };

  const costMultiplier = tech.costMultiplier ? tech.costMultiplier : 1;
  const researchCost = tech.cost.researchPoints ? tech.cost.researchPoints * costMultiplier : 0;

  // Deduct research points and resources
  const newResources = {
    ...resources,
    researchPoints: resources.researchPoints - researchCost,
    totalGold: resources.totalGold - (tech.cost.resources?.gold || 0),
    totalGems: resources.totalGems - (tech.cost.resources?.gems || 0),
    totalLumber: resources.totalLumber - (tech.cost.resources?.lumber || 0),
    totalStone: resources.totalStone - (tech.cost.resources?.stone || 0),
  };

  // Update tech level
  const newUnlockedTechs = {
    ...unlockedTechs,
    [techId]: currentLevel + 1
  };

  return { newResources, newUnlockedTechs };
};
