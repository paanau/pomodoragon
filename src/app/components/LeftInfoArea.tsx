'use client';

import React, { useState } from 'react';
import { useGameState } from '../GameState';
import { facilities, calculateUpgradeCost } from '../data/facilities';
import { techs } from '../data/techs';
import { calculateResourceIncome, calculatePopulationMax, calculatePopulationGrowth } from './Helpers';

const LeftInfoArea: React.FC = () => {
  const { state, setSelectedObject } = useGameState();
  const { facilities: gameFacilities, resources, societyFocus, unlockedTechs } = state.gameInfo;
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const renderHoverover = (target: string | null) => {
    if (!target) return null;

    const targetData = facilities[target];
    if (!targetData) return null;

    if (popupPosition.y + 200 > window.innerHeight) {
      setPopupPosition({ x: popupPosition.x, y: window.innerHeight - 200 });
    }

    const upgradeCost = calculateUpgradeCost(facilities[target], state.gameInfo.facilities[target]?.level || 0);

    const goldCost = upgradeCost.gold > 0 ? `${upgradeCost.gold} gold` : '';
    const gemsCost = upgradeCost.gems > 0 ? `${upgradeCost.gems} gems` : '';
    const lumberCost = upgradeCost.resources?.lumber > 0 ? `${upgradeCost.resources?.lumber} lumber` : '';
    const stoneCost = upgradeCost.resources?.stone > 0 ? `${upgradeCost.resources?.stone} stone` : '';

    const productionAmount = targetData.baseProduction?.amount || 0;
    const productionEfficiency = targetData.baseEfficiency || 1;
    const productionLevel = state.gameInfo.facilities[target]?.level || 0;
    const productionSocietyFocus = state.gameInfo.societyFocus.production || 1;
    const researchSocietyFocus = state.gameInfo.societyFocus.research || 1;
    let production = productionAmount * productionEfficiency * productionLevel;
    let productionResource = targetData.baseProduction?.resourceType || '';
    if (productionResource === 'researchPoints') {
      productionResource = 'research';
      production *= researchSocietyFocus;
    } else if (targetData.baseProduction?.type === 'resource') {
      production *= productionSocietyFocus;
    }

    return (
      <div 
        className="popup-container" 
        style={{ 
          position: 'fixed',
          top: popupPosition.y,
          left: popupPosition.x,
          zIndex: 1000
        }}
      >
        <div className="popup-content">
          <h3 className="popup-title">{targetData.name}</h3>
          <p className="popup-description">{targetData.description}</p>
          <p className="popup-cost">Cost: {goldCost} {gemsCost} {lumberCost} {stoneCost}</p>
          <p className="popup-production">Production: {production} {productionResource} per turn</p>
        </div>
      </div>
    );
  }

  const renderFacilities = () => {
    const existingFacilities = Object.entries(gameFacilities).map(([id, facility]) => {
      const facilityData = facilities[id];
      if (!facilityData) return null;

      return (
        <div
          key={id}
          className="info-item"
          onClick={() => setSelectedObject({ type: 'facility', data: { ...facility, id } })}
          onMouseEnter={(e) => {
            setHoveredFacility(id);
            setPopupPosition({ x: e.clientX + 10, y: e.clientY + 10 });
          }}
          onMouseLeave={() => setHoveredFacility(null)}
        >
          <div className="flex items-center">
            {facility.icon}
            <span>{facilityData.name} Lv.{facility.level}</span>
            {facility.isConstructing && (
              <div className="progress-bar w-24">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(facility.constructionProgress / facilityData.constructionTime) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      );
    });

    const availableFacilities = Object.entries(facilities)
      .filter(([id]) => !gameFacilities[id])
      .map(([id, facility]) => (
        <div
          key={id}
          className="info-item"
          onClick={() => setSelectedObject({ type: 'facility', data: { id, level: 0, constructionProgress: 0, isConstructing: false } })}
          onMouseEnter={(e) => {
            setHoveredFacility(id);
            setPopupPosition({ x: e.clientX + 10, y: e.clientY + 10 });
          }}
          onMouseLeave={() => setHoveredFacility(null)}
        >
          <div className="flex items-center">
            {facility.icon}
            <span>{facility.name}</span>
          </div>
        </div>
      ));

    return (
      <div className="info-section">
        <h3 className="info-section-title">Facilities</h3>
        <div className="info-section-content">
          {existingFacilities}
          {availableFacilities}
        </div>
      </div>
    );
  };

  const renderResources = () => {
    const goldIncome = calculateResourceIncome('gold', gameFacilities, societyFocus, unlockedTechs);
    const lumberIncome = calculateResourceIncome('lumber', gameFacilities, societyFocus, unlockedTechs);
    const stoneIncome = calculateResourceIncome('stone', gameFacilities, societyFocus, unlockedTechs);
    const populationMax = calculatePopulationMax(state.gameInfo.facilities.housing?.level || 0);
    const populationGrowth = calculatePopulationGrowth(
      state.gameInfo.resources.totalPopulation,
      populationMax,
      state.gameInfo.societyFocus.growth
    );
    const researchPointsIncome = calculateResourceIncome('researchPoints', gameFacilities, societyFocus, unlockedTechs);
    
    return (
      <div className="info-section">
        <h3 className="info-section-title">Resources</h3>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'gold', data: {} })}>
          Gold: {state.gameInfo.resources.totalGold} (+{goldIncome.toFixed(0)}/turn)
        </div>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'gems', data: {} })}>
          Gems: {state.gameInfo.resources.totalGems}
        </div>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'lumber', data: {} })}>
          Lumber: {state.gameInfo.resources.totalLumber} (+{lumberIncome.toFixed(0)}/turn)
        </div>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'stone', data: {} })}>
          Stone: {state.gameInfo.resources.totalStone} (+{stoneIncome.toFixed(0)}/turn)
        </div>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'population', data: {} })}>
          Population: {state.gameInfo.resources.totalPopulation} / {populationMax} (+{populationGrowth}/turn)
        </div>
        <div className="info-item hover-lift" onClick={() => setSelectedObject({ type: 'researchPoints', data: {} })}>
          Research Points: {state.gameInfo.resources.researchPoints} (+{researchPointsIncome.toFixed(0)}/turn)
        </div>
      </div>
    );
  };

  return (
    <div className="left-info-area">
      {renderResources()}
      {renderFacilities()}

      <div className="info-section">
        <h3 className="info-section-title">Society Focus</h3>
        <div className="info-section-content">
          {Object.entries(state.gameInfo.societyFocus).map(([type, value]) => (
            <div
              key={type}
              className="info-item"
              onClick={() => setSelectedObject({ type: 'societyFocus', data: { type, value } })}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}: {value}
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Active Explorations</h3>
        <div className="info-section-content">
          {Object.entries(state.gameInfo.activeExplorations).map(([id, exploration]) => (
            <div
              key={id}
              className="info-item"
              onClick={() => setSelectedObject({ type: 'exploration', data: { ...exploration, id } })}
            >
              <div className="flex justify-between items-center">
                <span>{exploration.type}</span>
                <div className="progress-bar w-24">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${exploration.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Trade Routes</h3>
        <div className="info-section-content">
          {Object.entries(state.gameInfo.tradeRoutes).map(([id, route]) => (
            <div
              key={id}
              className="info-item"
              onClick={() => setSelectedObject({ type: 'tradeRoute', data: { ...route, id } })}
            >
              <div className="flex justify-between items-center">
                <span>{route.destination}</span>
                <div className="progress-bar w-24">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${route.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hoveredFacility && renderHoverover(hoveredFacility)}
    </div>
  );
};

export default LeftInfoArea; 