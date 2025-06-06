'use client';

import React from 'react';
import { useGameState } from '../GameState';
import { facilities, calculateUpgradeCost, Facility } from '../data/facilities';
import { Tech, techs } from '../data/techs';
import { calculateAllResourceIncome, calculateProgress } from './Helpers';

const RightDetailArea: React.FC = () => {

  const { state, updateGameInfo, updateSocietyFocus, startConstruction, startTradeRoute, startExploration, researchTech } = useGameState();
  // Force re-render when turn advances, selected object changes, or facility data changes
  React.useEffect(() => {
    console.log('RightDetailArea state updated:', {
      turn: state.gameInfo.currentTurn,
      selectedObject: state.selectedObject,
      facilities: state.gameInfo.facilities
    });
  }, [state.gameInfo.currentTurn, state.selectedObject, state.gameInfo.facilities]);

  const renderDetails = React.useCallback(() => {
    if (!state.selectedObject) {
      return <p className="detail-content">Select an item to view details</p>;
    }

    const { type } = state.selectedObject;
    console.log('Rendering details for:', type, state.selectedObject);

    // For facilities, get the latest facility data
    if (type === 'facility') {
      const facilityId = state.selectedObject.data.id;
      const currentFacility = state.gameInfo.facilities[facilityId];
      if (currentFacility) {
        // Update the selected object with current facility data
        state.selectedObject.data = currentFacility;
      }
    }

    switch (type) {
      case 'gold':
      case 'gems':
      case 'lumber':
      case 'stone':
        return renderResourceDetails();
      case 'population':
        return renderPopulationDetails();
      case 'societyFocus':
        return renderSocietyFocusDetails();
      case 'exploration':
        return renderExplorationDetails(state.selectedObject.data);
      case 'tradeRoute':
        return renderTradeRouteDetails(state.selectedObject.data);
      case 'facility':
        return renderFacilityDetails(state.selectedObject.data);
      case 'researchPoints':
        return renderResearchPointsDetails();
      default:
        return <p className="detail-content">Unknown selection type</p>;
    }
  }, [state, updateGameInfo, updateSocietyFocus, startConstruction, researchTech]);

  const renderResourceDetails = () => {
    const resourceIncome = calculateAllResourceIncome(
      state.gameInfo.facilities,
      state.gameInfo.societyFocus,
      state.gameInfo.unlockedTechs
    );
    
    return (
      <div className="detail-section">
        <div className="detail-title">Resources</div>
        <div className="resource-group">
          <span>Gold: {state.gameInfo.resources.totalGold} (+{resourceIncome.gold}/turn)</span>
          <div className="resource-details">
            <span>Income: {resourceIncome.gold}</span>
          </div>
        </div>
        <div className="resource-group">
          <span>Gems: {state.gameInfo.resources.totalGems} (+{resourceIncome.gems}/turn)</span>
          <div className="resource-details">
            <span>Income: {resourceIncome.gems}</span>
          </div>
        </div>
        <div className="resource-group">
          <span>Lumber: {state.gameInfo.resources.totalLumber} (+{resourceIncome.lumber}/turn)</span>
          <div className="resource-details">
            <span>Income: {resourceIncome.lumber}</span>
          </div>
        </div>
        <div className="resource-group">
          <span>Stone: {state.gameInfo.resources.totalStone} (+{resourceIncome.stone}/turn)</span>
          <div className="resource-details">
            <span>Income: {resourceIncome.stone}</span>
          </div>
        </div>
        <div className="resource-group">
          <span>Research Points: {state.gameInfo.resources.researchPoints} (+{resourceIncome.researchPoints}/turn)</span>
          <div className="resource-details">
            <span>Income: {resourceIncome.researchPoints}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSocietyFocusDetails = () => {
    const focusTypes = ['growth', 'production', 'research', 'exploration', 'trade'] as const;

    const totalFocus = (Object.values(state.gameInfo.societyFocus) as number[]).reduce((acc, cur) => acc + cur, 0);
    return (
      <div className="detail-section">
        <div className="detail-title">Society Focus {totalFocus} / {state.gameInfo.resources.totalPopulation}</div>
        <div className="focus-buttons">
          {focusTypes.map(type => (
            <div key={type}> {type.charAt(0).toUpperCase() + type.slice(1)}: 
                <div className="focus-button-group">
                <button
                    className="game-button button-primary"
                    onClick={() => updateSocietyFocus({ [type]: Math.max(0, state.gameInfo.societyFocus[type] - 1) })}
                >
                    -
                </button>
                <span className="focus-level">{state.gameInfo.societyFocus[type].toString()}</span>
                <button
                    className="game-button button-primary"
                    onClick={() => updateSocietyFocus({ [type]: state.gameInfo.societyFocus[type] + 1 })}
                >
                    +
                </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExplorationDetails = (data: { id: string; type: string; progress: number; units: string[]; equipment: string[] }) => {
    return (
      <div className="detail-section">
        <h3 className="detail-title">Exploration Details</h3>
        <p className="detail-content">Type: {data.type}</p>
        <div className="progress-bar mt-2 mb-4">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div>
          <h4 className="detail-title">Units:</h4>
          <ul className="game-list">
            {data.units.map((unit, index) => (
              <li key={index} className="game-list-item">{unit}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h4 className="detail-title">Equipment:</h4>
          <ul className="game-list">
            {data.equipment.map((item, index) => (
              <li key={index} className="game-list-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderTradeRouteDetails = (data: { id: string; destination: string; progress: number; isActive: boolean; repeat: boolean }) => {
    return (
      <div className="detail-section">
        <h3 className="detail-title">Trade Route Details</h3>
        <p className="detail-content">Destination: {data.destination}</p>
        <div className="progress-bar mt-2 mb-4">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <p className="detail-content">Status: {data.isActive ? 'Active' : 'Inactive'}</p>
        <p className="detail-content">Repeat: {data.repeat ? 'Yes' : 'No'}</p>
      </div>
    );
  };

  const renderResearchPointsDetails = () => {
    return (
      <div className="detail-section">
        <h3 className="detail-title">Research Points</h3>
        <p className="detail-content">Research Points: {state.gameInfo.resources.researchPoints}</p>
        <div className="mt-4">
          <h4 className="detail-title">Researchable Techs</h4>
          <ul className="game-list">
            {Object.values(techs).map((tech: Tech) => {
              const currentLevel = state.gameInfo.unlockedTechs[tech.id] || 0;
              const nextLevel = currentLevel + 1;
              const costMultiplier = nextLevel;
              const researchCost = tech.cost.researchPoints ? tech.cost.researchPoints * costMultiplier : 0;
              
              // Skip if tech is at max level
              if (tech.maxLevel && currentLevel >= tech.maxLevel) return null;
              
              // Check if requirements are met
              const canResearch = tech.requirements.every(req => {
                if (req.type === 'tech') {
                  const requiredLevel = state.gameInfo.unlockedTechs[req.id] || 0;
                  return requiredLevel >= (req.level || 1);
                }
                return true;
              });

              if (!canResearch) return null;

              return (
                <li key={tech.id} className="game-list-item">
                  <button 
                    className="game-button button-primary" 
                    onClick={() => researchTech(tech.id)}
                    disabled={state.gameInfo.resources.researchPoints < researchCost}
                  >
                    {tech.name} (Level {currentLevel} ⇒ {nextLevel}) - {researchCost} RP
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-4">
          <h4 className="detail-title">Researched Techs</h4>
          <ul className="game-list">
            {Object.entries(state.gameInfo.unlockedTechs).map(([techId, level]) => (
              <li key={techId} className="game-list-item">
                {techs[techId].name} (Level {level.toString()})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderFacilityDetails = (
    data: { id: string; level: number; constructionProgress: number; isConstructing: boolean },
  ) => {
    const facilityData = facilities[data.id];
    if (!facilityData) return null;

    const canAffordUpgrade = () => {
      const cost = calculateUpgradeCost(facilityData, data.level);
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

    const handleUpgrade = () => {
      const cost = calculateUpgradeCost(facilityData, data.level);
      updateGameInfo({
        resources: {
          totalGold: state.gameInfo.resources.totalGold - cost.gold,
          totalGems: state.gameInfo.resources.totalGems - cost.gems,
          totalLumber: cost.resources?.lumber ? state.gameInfo.resources.totalLumber - cost.resources.lumber : state.gameInfo.resources.totalLumber,
          totalStone: cost.resources?.stone ? state.gameInfo.resources.totalStone - cost.resources.stone : state.gameInfo.resources.totalStone,
          totalPopulation: state.gameInfo.resources.totalPopulation,
          totalSoldiers: state.gameInfo.resources.totalSoldiers,
          researchPoints: state.gameInfo.resources.researchPoints
        }
      });
      startConstruction(data.id);
    };

    const nextLevelCost = calculateUpgradeCost(facilityData, data.level);
    const constructionTime = data.level === 0 
      ? facilityData.constructionTime 
      : facilityData.repeatable 
        ? Math.ceil(nextLevelCost.constructionTime || facilityData.constructionTime * Math.pow(1.5, data.level))
        : facilityData.upgrades[data.level - 1]?.constructionTime || 0;

    console.log('Facility details:', {
      id: data.id,
      level: data.level,
      constructionTime,
      nextLevelCost,
      isConstructing: data.isConstructing,
      constructionProgress: data.constructionProgress
    });

    return (
      <div className="detail-section">
        <h3 className="detail-title">{facilityData.iconBig} {facilityData.name}</h3>
        <p className="detail-content">{facilityData.description}</p>
        
        <div className="mt-4">
          <h4 className="detail-title">Current Level: {data.level}</h4>
          {data.isConstructing && (
            <div className="mt-2">
              <p className="detail-content">Construction Progress:</p>
              <div className="progress-bar mt-2">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${calculateProgress(data.constructionProgress, constructionTime)}%` }}
                />
              </div>
              <p className="detail-content text-sm mt-1">
                {data.constructionProgress} / {constructionTime} turns
              </p>
            </div>
          )}
        </div>

        {!data.isConstructing && data.level < facilityData.maxLevel && (
          <div className="mt-4">
            <h4 className="detail-title">Upgrade to Level {data.level + 1}</h4>
            <div className="mt-2">
              <p className="detail-content">Cost:</p>
              <ul className="game-list">
                <li>{nextLevelCost.gold} Gold</li>
                {nextLevelCost.gems > 0 && <li>{nextLevelCost.gems} Gems</li>}
                {nextLevelCost.resources?.lumber && <li>{nextLevelCost.resources.lumber} Lumber</li>}
                {nextLevelCost.resources?.stone && <li>{nextLevelCost.resources.stone} Stone</li>}
              </ul>
              <p className="detail-content text-sm mt-1">
                Construction Time: {constructionTime} turns
              </p>
            </div>
            <button 
              className={`game-button button-primary mt-4 ${!canAffordUpgrade() ? 'disabled' : ''}`}
              onClick={handleUpgrade}
              disabled={!canAffordUpgrade()}
            >
              Upgrade Facility
            </button>
          </div>
        )}

        {facilityData.baseProduction && (
          <div className="mt-4">
            <h4 className="detail-title">Production</h4>
            <p className="detail-content">
              {facilityData.baseProduction.type === 'resource' && facilityData.baseProduction.resourceType !== 'researchPoints' &&
                `Produces ${facilityData.baseProduction.amount * (facilityData.baseEfficiency || 1) * data.level * state.gameInfo.societyFocus.production} ${facilityData.baseProduction.resourceType} per ${facilityData.baseProduction.interval} turns`}
              {facilityData.baseProduction.type === 'resource' && facilityData.baseProduction.resourceType === 'researchPoints' &&
                `Generates ${facilityData.baseProduction.amount * (facilityData.baseEfficiency || 1) * data.level * state.gameInfo.societyFocus.research} research per ${facilityData.baseProduction.interval} turns`}
            </p>
          </div>
        )}

        {facilityData.baseCapacity && (
          <div className="mt-4">
            <h4 className="detail-title">Capacity</h4>
            <p className="detail-content">
              Current capacity: {facilityData.baseCapacity * data.level}
            </p>
          </div>
        )}

        {facilityData.requirements && (
          <div className="mt-4">
            <h4 className="detail-title">Requirements</h4>
            <ul className="game-list">
              {facilityData.requirements.population && 
                <li>Population: {facilityData.requirements.population}</li>}
              {facilityData.requirements.facilities?.map((facilityId: string) => (
                <li key={facilityId}>{facilities[facilityId]?.name || facilityId}</li>
              ))}
              {facilityData.requirements.research?.map((researchId: string) => (
                <li key={researchId}>{researchId}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderPopulationDetails = () => {
    return (
      <div className="detail-section">
        <h3 className="detail-title">Population</h3>
        <p className="detail-content">Population: {state.gameInfo.resources.totalPopulation}</p>
      </div>
    );
  }

  return (
    <div className="right-detail-area">
      <div className="mb-4">
        <h2 className="info-section-title">Details</h2>
        <div className="mt-4">
          {renderDetails()}
        </div>
      </div>
    </div>
  );
};

export default RightDetailArea; 