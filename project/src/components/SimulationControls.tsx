import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Settings, Zap, Clock } from 'lucide-react';
import { SimulationState } from '../types/PetriNet';

interface SimulationControlsProps {
  simulationState: SimulationState;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  enabledTransitions: string[];
  onTransitionFire: (transitionId: string) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulationState,
  onPlay,
  onPause,
  onStep,
  onStepBack,
  onReset,
  onSpeedChange,
  enabledTransitions,
  onTransitionFire
}) => {
  const speeds = [
    { label: 'Très lent', value: 2500, icon: '🐌' },
    { label: 'Lent', value: 1800, icon: '🚶' },
    { label: 'Normal', value: 1200, icon: '🚴' },
    { label: 'Rapide', value: 600, icon: '🏃' },
    { label: 'Très rapide', value: 300, icon: '🚀' }
  ];

  const currentSpeed = speeds.find(s => s.value === simulationState.speed) || speeds[2];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Zap className="text-blue-500" size={24} />
          <span>Contrôles de Simulation</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
          <Clock size={16} />
          <span>Étape: <strong className="text-blue-600">{simulationState.step}</strong></span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3">
        {simulationState.isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Pause size={18} />
            <span className="font-medium">Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            disabled={enabledTransitions.length === 0}
          >
            <Play size={18} />
            <span className="font-medium">Lecture</span>
          </button>
        )}

        <button
          onClick={onStep}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          disabled={enabledTransitions.length === 0}
        >
          <SkipForward size={18} />
          <span className="font-medium">Étape</span>
        </button>

        <button
          onClick={onStepBack}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
          disabled={simulationState.step === 0}
        >
          <SkipBack size={18} />
          <span className="font-medium">Retour</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <RotateCcw size={18} />
          <span className="font-medium">Reset</span>
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Settings size={18} className="text-gray-500" />
          <label className="text-sm font-semibold text-gray-700">Vitesse de simulation:</label>
        </div>
        <div className="relative">
          <select
            value={simulationState.speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
          >
            {speeds.map(speed => (
              <option key={speed.value} value={speed.value}>
                {speed.icon} {speed.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Vitesse actuelle: {currentSpeed.icon} {currentSpeed.label}
        </div>
      </div>

      {/* Manual Transition Firing */}
      {enabledTransitions.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
            <Zap size={16} className="text-yellow-500" />
            <span>Tirer une transition manuellement:</span>
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {enabledTransitions.map(transitionId => (
              <button
                key={transitionId}
                onClick={() => onTransitionFire(transitionId)}
                className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{transitionId}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {enabledTransitions.length === 0 && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">⚠️ Aucune transition activée</span>
          </div>
          <p className="text-sm mt-1 text-red-700">
            Possible blocage détecté! Vérifiez les conditions d'activation.
          </p>
        </div>
      )}

      {simulationState.isRunning && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">🔄 Simulation en cours...</span>
          </div>
          <p className="text-sm mt-1 text-blue-700">
            {enabledTransitions.length} transition(s) disponible(s)
          </p>
        </div>
      )}
    </div>
  );
};