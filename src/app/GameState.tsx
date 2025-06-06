'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Facility, facilities as facilityData, calculateUpgradeCost } from './data/facilities';
import { techs } from './data/techs';
import { FacilityProduction, FacilityUpgrade } from './data/facilities';
import { 
  calculateConstructionProgress, 
  calculateFacilityProduction, 
  canResearchTech, 
  applyResearchTech 
} from './components/Helpers';

export interface SocietyFocus {
  growth: number;
  production: number;
  research: number;
  exploration: number;
  trade: number;
}

interface GameState {
  selectedObject: any | null;
  gameInfo: {
    // Resources
    resources: {
      totalGold: number;
      totalGems: number;
      totalLumber: number;
      totalStone: number;
      totalPopulation: number;
      totalSoldiers: number;
      researchPoints: number;
    }
    // Game Progress
    currentTurn: number;
    savedTurns: number;
    isWorkPhase: boolean;
    
    // Society
    societyFocus: SocietyFocus;
    experienceBuff: number;
    
    // Facilities
    facilities: {
      [key: string]: {
        id: string;
        level: number;
        constructionProgress: number;
        isConstructing: boolean;
        productionProgress?: number;
        icon: React.ReactNode;
      }
    };
    
    // Trade
    tradeRoutes: {
      [key: string]: {
        destination: string;
        progress: number;
        isActive: boolean;
        repeat: boolean;
      }
    };
    
    // Exploration
    activeExplorations: {
      [key: string]: {
        type: string;
        progress: number;
        units: string[];
        equipment: string[];
      }
    };
    
    // Research
    unlockedTechs: {
      [key: string]: number; // techId -> level
    };
    unlockedBlueprints: string[];
    unlockedStratagems: string[];
    
    // Raid
    raidParty: {
      units: string[];
      equipment: string[];
      stratagem: string | null;
    };

    // Pomodoro
    pomodoro: {
      workDuration: number;
      breakDuration: number;
    };
  };
}

interface GameStateContextType {
  state: GameState;
  setSelectedObject: (object: any) => void;
  updateGameInfo: (info: Partial<GameState['gameInfo']>) => void;
  updateSocietyFocus: (focus: Partial<SocietyFocus>) => void;
  startConstruction: (facilityId: string) => void;
  upgradeFacility: (facilityId: string) => void;
  startTradeRoute: (routeId: string, destination: string) => void;
  startExploration: (explorationId: string, type: string) => void;
  updateRaidParty: (party: Partial<GameState['gameInfo']['raidParty']>) => void;
  advanceTurn: () => void;
  researchTech: (techId: string) => boolean;
  pomodoroTimer: () => {
    timeLeft: number;
    isRunning: boolean;
    isBreak: boolean;
    start: () => void;
    stop: () => void;
    reset: () => void;
    skip: () => void;
  };
}

interface GameStateFacility {
  id: string;
  level: number;
  constructionProgress: number;
  isConstructing: boolean;
  productionProgress?: number;
  icon: React.ReactNode;
}

interface GameStateUpdate {
  gameInfo: {
    facilities: {
      [key: string]: GameStateFacility;
    };
    resources: {
      totalGold: number;
      totalLumber: number;
      totalStone: number;
      researchPoints: number;
    };
  };
}

const defaultGameState: GameState = {
  selectedObject: null,
  gameInfo: {
    resources: {
      totalGold: 1000,
      totalGems: 0,
      totalLumber: 500,
      totalStone: 500,
      totalPopulation: 10,
      totalSoldiers: 5,
      researchPoints: 0,
    },
    currentTurn: 1,
    savedTurns: 0,
    isWorkPhase: true,
    societyFocus: {
      growth: 4,
      production: 4,
      research: 2,
      exploration: 0,
      trade: 0
    },
    experienceBuff: 0,
    facilities: {
      housing: {
        id: 'housing',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.housing.icon
      },
      lumberMill: {
        id: 'lumberMill',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.lumberMill.icon
      },
      quarry: {
        id: 'quarry',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.quarry.icon
      },
      mine: {
        id: 'mine',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.mine.icon
      },
      barracks: {
        id: 'barracks',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.barracks.icon
      },
      library: {
        id: 'library',
        level: 1,
        constructionProgress: 0,
        isConstructing: false,
        productionProgress: 0,
        icon: facilityData.library.icon
      }
    },
    tradeRoutes: {},
    activeExplorations: {},
    unlockedTechs: {},
    unlockedBlueprints: [],
    unlockedStratagems: [],
    raidParty: {
      units: [],
      equipment: [],
      stratagem: null
    },
    pomodoro: {
      workDuration: 25,
      breakDuration: 5
    }
  }
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(defaultGameState);

  const setSelectedObject = (object: any) => {
    console.log('Setting selected object:', object);
    setState(prev => ({ ...prev, selectedObject: object }));
  };

  const updateGameInfo = (info: Partial<GameState['gameInfo']>) => {
    console.log('Updating game info:', info);
    setState(prev => ({
      ...prev,
      gameInfo: { ...prev.gameInfo, ...info }
    }));
  };

  const updateSocietyFocus = (focus: Partial<SocietyFocus>) => {
    // check if total of all focuses would be greater than population
    const newFocus = { ...state.gameInfo.societyFocus, ...focus };
    if (Object.values(newFocus).reduce((acc, curr) => acc + curr, 0) > state.gameInfo.resources.totalPopulation) {
      return;
    }
    
    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        societyFocus: { ...prev.gameInfo.societyFocus, ...focus }
      }
    }));
  };

  const startConstruction = (facilityId: string) => {
    const facility = facilityData[facilityId];
    if (!facility) return;

    setState(prev => {
      const existingFacility = prev.gameInfo.facilities[facilityId];
      
      return {
        ...prev,
        gameInfo: {
          ...prev.gameInfo,
          facilities: {
            ...prev.gameInfo.facilities,
            [facilityId]: {
              id: facilityId,
              level: existingFacility ? existingFacility.level : 0,
              constructionProgress: 0,
              isConstructing: true,
              productionProgress: existingFacility?.productionProgress || 0,
              icon: facilityData[facilityId].icon
            }
          }
        }
      };
    });
  };

  const updateFacilityConstruction = (
    facility: GameStateFacility,
    facilityConfig: Facility,
    newState: GameStateUpdate
  ) => {
    calculateConstructionProgress(facility, facilityConfig, newState);
  };

  const updateFacilityProduction = (
    facility: GameStateFacility,
    facilityConfig: Facility,
    newState: GameStateUpdate
  ) => {
    if (!state?.gameInfo?.societyFocus || !state?.gameInfo?.unlockedTechs) return;
    
    calculateFacilityProduction(
      facility, 
      facilityConfig, 
      state.gameInfo.societyFocus, 
      state.gameInfo.unlockedTechs, 
      newState
    );
  };

  const advanceTurn = () => {
    console.log('Advancing turn');
    setState(prev => {
      // Create a new state object instead of mutating the existing one
      const newState = {
        ...prev,
        gameInfo: {
          ...prev.gameInfo,
          facilities: { ...prev.gameInfo.facilities }
        }
      };

      // Update construction progress and production
      Object.entries(newState.gameInfo.facilities).forEach(([id, facility]) => {
        const facilityConfig = facilityData[id];
        if (!facilityConfig) return;

        // Create a new facility object
        newState.gameInfo.facilities[id] = { ...facility };

        // Update construction progress
        updateFacilityConstruction(facility, facilityConfig, newState);

        // Update production progress
        updateFacilityProduction(facility, facilityConfig, newState);
      });

      console.log('New state after turn advance:', {
        turn: newState.gameInfo.currentTurn + 1,
        facilities: newState.gameInfo.facilities
      });

      applyGrowthFocus();

      return {
        ...newState,
        gameInfo: {
          ...newState.gameInfo,
          currentTurn: newState.gameInfo.currentTurn + 1,
          isWorkPhase: !newState.gameInfo.isWorkPhase
        }
      };
    });
  };

  const applyGrowthFocus = () => {
    const housingData = facilityData["housing"];
    if (!housingData) return;
    const baseCapacity = housingData.baseCapacity ?? 10; // Default to 10 if undefined
    const maxPopulation = state.gameInfo.facilities.housing.level * baseCapacity;
    const population = state.gameInfo.resources.totalPopulation;
    const growth = state.gameInfo.societyFocus.growth;
    let newPopulation = population + growth;
    if (newPopulation > maxPopulation) {
      newPopulation = maxPopulation;
    }
    setState(prev => ({
      ...prev,
      gameInfo: { ...prev.gameInfo, resources: { ...prev.gameInfo.resources, totalPopulation: newPopulation } }
    }));
    return;
  }

  const researchTech = (techId: string) => {
    const currentLevel = state.gameInfo.unlockedTechs[techId] || 0;
    
    if (!canResearchTech(
      techId,
      currentLevel,
      state.gameInfo.resources,
      state.gameInfo.unlockedTechs,
      state.gameInfo.facilities
    )) {
      return false;
    }

    const { newResources, newUnlockedTechs } = applyResearchTech(
      techId,
      currentLevel,
      state.gameInfo.resources,
      state.gameInfo.unlockedTechs
    );

    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        resources: newResources,
        unlockedTechs: newUnlockedTechs
      }
    }));

    return true;
  };

  const canUpgradeFacility = (facilityId: string): boolean => {
    const facility = facilityData[facilityId];
    if (!facility) return false;

    const currentFacility = state.gameInfo.facilities[facilityId];
    if (!currentFacility || currentFacility.isConstructing) return false;

    // Check if facility is at max level and not repeatable
    if (currentFacility.level >= facility.maxLevel && !facility.repeatable) return false;

    // For repeatable facilities, always allow upgrade
    if (facility.repeatable) return true;

    // For non-repeatable facilities, check if next upgrade exists
    const nextUpgrade = facility.upgrades[currentFacility.level - 1];
    if (!nextUpgrade) return false;

    // Check if we can afford the upgrade
    const cost = calculateUpgradeCost(facility, currentFacility.level);
    if (cost.gold > state.gameInfo.resources.totalGold) return false;
    if (cost.gems > state.gameInfo.resources.totalGems) return false;
    if (cost.resources) {
      for (const [resource, amount] of Object.entries(cost.resources)) {
        const resourceAmount = amount as number;
        if (resource === 'lumber' && resourceAmount > state.gameInfo.resources.totalLumber) return false;
        if (resource === 'stone' && resourceAmount > state.gameInfo.resources.totalStone) return false;
      }
    }

    return true;
  };

  const upgradeFacility = (facilityId: string) => {
    if (!canUpgradeFacility(facilityId)) return;

    const facility = facilityData[facilityId];
    const currentFacility = state.gameInfo.facilities[facilityId];
    const cost = calculateUpgradeCost(facility, currentFacility.level);

    // Deduct resources
    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        resources: {
          ...prev.gameInfo.resources,
          totalGold: prev.gameInfo.resources.totalGold - cost.gold,
          totalGems: prev.gameInfo.resources.totalGems - cost.gems,
          totalLumber: cost.resources?.lumber ? prev.gameInfo.resources.totalLumber - cost.resources.lumber : prev.gameInfo.resources.totalLumber,
          totalStone: cost.resources?.stone ? prev.gameInfo.resources.totalStone - cost.resources.stone : prev.gameInfo.resources.totalStone,
        },
        facilities: {
          ...prev.gameInfo.facilities,
          [facilityId]: {
            ...currentFacility,
            constructionProgress: 0,
            isConstructing: true
          }
        }
      }
    }));
  };

  const startTradeRoute = (routeId: string, destination: string) => {
    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        tradeRoutes: {
          ...prev.gameInfo.tradeRoutes,
          [routeId]: {
            destination,
            progress: 0,
            isActive: true,
            repeat: false
          }
        }
      }
    }));
  };

  const startExploration = (explorationId: string, type: string) => {
    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        activeExplorations: {
          ...prev.gameInfo.activeExplorations,
          [explorationId]: {
            type,
            progress: 0,
            units: [],
            equipment: []
          }
        }
      }
    }));
  };

  const updateRaidParty = (party: Partial<GameState['gameInfo']['raidParty']>) => {
    setState(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        raidParty: { ...prev.gameInfo.raidParty, ...party }
      }
    }));
  };
  const pomodoroAlarm = () => {
    const audio = new Audio('/audio/alarm.mp3');
    audio.play();
    setTimeout(() => {
      audio.pause();
    }, 10000);
  }
  let turnSaveCounter = 0;

  const pomodoroTimer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [timeLeft, setTimeLeft] = useState(isBreak ? state.gameInfo.pomodoro.breakDuration * 60 * 1000 : state.gameInfo.pomodoro.workDuration * 60 * 1000);


    useEffect(() => {
      if (isRunning) {
        const interval = setInterval(() => {
          setTimeLeft(prev => prev - 100000);
          turnSaveCounter++;
          if (turnSaveCounter >= 3) {
            turnSaveCounter = 0;
            setState(prev => ({
              ...prev,
              gameInfo: { ...prev.gameInfo, savedTurns: prev.gameInfo.savedTurns + 1 }
            }));
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [isRunning]);

    useEffect(() => {
      if (timeLeft <= 0) {
        setIsBreak(!isBreak);
        setTimeLeft(isBreak ? state.gameInfo.pomodoro.workDuration * 60 * 1000 : state.gameInfo.pomodoro.breakDuration * 60 * 1000);
        if (!isBreak) {
          pomodoroAlarm();
        }
      }
    }, [timeLeft]);

    return {
      timeLeft,
      isRunning,
      isBreak,
      start: () => setIsRunning(true),
      stop: () => setIsRunning(false),
      reset: () => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(state.gameInfo.pomodoro.workDuration * 60 * 1000);
      },
      skip: () => {
        setIsRunning(false);
        setIsBreak(!isBreak);
        setTimeLeft(isBreak ? state.gameInfo.pomodoro.workDuration * 60 * 1000 : state.gameInfo.pomodoro.breakDuration * 60 * 1000);
      }
    };
  }

  const value = {
    state,
    setSelectedObject,
    updateGameInfo,
    updateSocietyFocus,
    startConstruction,
    upgradeFacility,
    startTradeRoute,
    startExploration,
    updateRaidParty,
    advanceTurn,
    researchTech,
    pomodoroTimer
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}; 