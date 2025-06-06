'use client';

import React from 'react';
import { useGameState } from '../GameState';
import { formatTime, calculateProgress, calculateCircumference, calculateStrokeDashoffset } from './Helpers';

const CenterGameArea: React.FC = () => {
  const { state, advanceTurn, pomodoroTimer } = useGameState();
  const { currentTurn, savedTurns, pomodoro } = state.gameInfo;
  const { timeLeft, isRunning, isBreak, start, stop, reset, skip } = pomodoroTimer();
  const displayTime = formatTime(timeLeft);
  const breakText = isBreak ? 'Break' : 'Work';
  const savedTurnsText = savedTurns > 0 ? `, with ${savedTurns} saved turns` : '';

  React.useEffect(() => {
    console.log('CenterGameArea state updated:', {
      turn: currentTurn,
      savedTurns: savedTurns,
      pomodoro: pomodoro
    });
  }, [currentTurn, savedTurns, pomodoro]);

  const PomodoroTimer: React.FC = () => {
    const totalTime = isBreak ? pomodoro.breakDuration * 60 * 1000 : pomodoro.workDuration * 60 * 1000;
    const progress = calculateProgress(totalTime - timeLeft, totalTime);
    const circumference = calculateCircumference(90); // radius = 90
    const strokeDashoffset = calculateStrokeDashoffset(circumference, progress);

    return (
      <div className="pomodoro-timer">
        <div className="timer-circle">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              className="timer-circle-background"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="timer-circle-progress"
              cx="100"
              cy="100"
              r="90"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="timer-content">
            <div className="phase-indicator">{breakText}</div>
            <div className="timer-display">{displayTime}</div>
          </div>
        </div>
        <button className="game-button button-primary" onClick={start}>Start</button>
        <button className="game-button button-primary" onClick={stop}>Stop</button>
        <button className="game-button button-primary" onClick={reset}>Reset</button>
        <button className="game-button button-primary" onClick={skip}>Skip</button>
      </div>
    );
  };
  
  const TurnControl: React.FC = () => {
    return (
      <div className="turn-control" onClick={advanceTurn}>
        <div className="turn-info">Turn {currentTurn}{savedTurnsText}</div>
      </div>
    );
  };
  
  return (
    <div className="center-game-area">
      <PomodoroTimer />
      <TurnControl />
    </div>
  );
};

export default CenterGameArea; 