import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Cog, BarChart3, BookOpen, Zap, Factory, Activity } from 'lucide-react';
import { PetriNetCanvas } from './components/PetriNetCanvas';
import { SimulationControls } from './components/SimulationControls';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ExampleSelector } from './components/ExampleSelector';
import { PropertyPanel } from './components/PropertyPanel';
import { PetriNetEngine } from './utils/petriNetEngine';
import { PetriNet, Position } from './types/PetriNet';
import { assemblyLineExample } from './data/productionExamples';

type AppMode = 'simulation' | 'analysis' | 'examples' | 'properties';

function App() {
  const [net, setNet] = useState<PetriNet>(assemblyLineExample);
  const [engine] = useState(() => new PetriNetEngine(assemblyLineExample));
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const [animatingTransition, setAnimatingTransition] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<AppMode>('simulation');
  const [selectedElement, setSelectedElement] = useState<{ type: 'place' | 'transition' | 'arc'; id: string } | null>(null);
  const [canvasTransform, setCanvasTransform] = useState({ scale: 1, offset: { x: 0, y: 0 } });

  // Update engine when net changes
  useEffect(() => {
    engine.updateNet(net);
  }, [net, engine]);

  // Auto-simulation logic
  useEffect(() => {
    const simulationState = engine.getSimulationState();
    
    if (simulationState.isRunning) {
      const interval = setInterval(() => {
        const enabledTransitions = engine.getEnabledTransitions();
        if (enabledTransitions.length > 0) {
          const randomTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
          fireTransition(randomTransition);
        } else {
          // No enabled transitions - stop simulation
          handlePause();
        }
      }, simulationState.speed);
      
      setSimulationInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  }, [engine.getSimulationState().isRunning, engine.getSimulationState().speed]);

  const fireTransition = (transitionId: string) => {
    setAnimatingTransition(transitionId);
    
    // Animate for a short duration
    setTimeout(() => {
      const success = engine.fireTransition(transitionId);
      if (success) {
        setNet({ ...engine.getNet() });
      }
      setAnimatingTransition(null);
    }, 400);
  };

  const handlePlay = () => {
    const currentState = engine.getSimulationState();
    if (!currentState.isRunning && engine.getEnabledTransitions().length > 0) {
      currentState.isRunning = true;
    }
  };

  const handlePause = () => {
    const currentState = engine.getSimulationState();
    currentState.isRunning = false;
  };

  const handleStep = () => {
    const enabledTransitions = engine.getEnabledTransitions();
    if (enabledTransitions.length > 0) {
      const randomTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
      fireTransition(randomTransition);
    }
  };

  const handleStepBack = () => {
    const success = engine.stepBack();
    if (success) {
      setNet({ ...engine.getNet() });
    }
  };

  const handleReset = () => {
    engine.reset();
    setNet({ ...engine.getNet() });
    handlePause();
  };

  const handleSpeedChange = (speed: number) => {
    const currentState = engine.getSimulationState();
    currentState.speed = speed;
  };

  const handleExampleSelect = (exampleNet: PetriNet) => {
    setNet(exampleNet);
    engine.updateNet(exampleNet);
    handleReset();
    setActiveMode('simulation');
  };

  const handlePlaceClick = (place: any) => {
    setSelectedElement({ type: 'place', id: place.id });
    setActiveMode('properties');
  };

  const handleTransitionClick = (transition: any) => {
    // If not in simulation mode, just select for properties
    if (activeMode !== 'simulation') {
      setSelectedElement({ type: 'transition', id: transition.id });
      setActiveMode('properties');
    } else {
      // In simulation mode, try to fire the transition
      if (engine.isTransitionEnabled(transition.id)) {
        fireTransition(transition.id);
      } else {
        setSelectedElement({ type: 'transition', id: transition.id });
        setActiveMode('properties');
      }
    }
  };

  const handleNetUpdate = (updatedNet: PetriNet) => {
    setNet(updatedNet);
    engine.updateNet(updatedNet);
  };

  const modes = [
    { 
      id: 'simulation' as AppMode, 
      label: 'Simulation', 
      icon: Play, 
      color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      description: 'Contrôler et observer la simulation du réseau'
    },
    { 
      id: 'analysis' as AppMode, 
      label: 'Analyse', 
      icon: BarChart3, 
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      description: 'Analyser les propriétés et performances du système'
    },
    { 
      id: 'examples' as AppMode, 
      label: 'Exemples', 
      icon: BookOpen, 
      color: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      description: 'Charger des exemples de systèmes de production'
    },
    { 
      id: 'properties' as AppMode, 
      label: 'Propriétés', 
      icon: Cog, 
      color: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      description: 'Modifier les propriétés des éléments sélectionnés'
    }
  ];

  const renderSidePanel = () => {
    switch (activeMode) {
      case 'simulation':
        return (
          <SimulationControls
            simulationState={engine.getSimulationState()}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onStepBack={handleStepBack}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            enabledTransitions={engine.getEnabledTransitions()}
            onTransitionFire={fireTransition}
          />
        );
      case 'analysis':
        return (
          <AnalysisPanel
            analysis={engine.analyzeNet()}
            metrics={engine.getMetrics()}
          />
        );
      case 'examples':
        return <ExampleSelector onExampleSelect={handleExampleSelect} />;
      case 'properties':
        return (
          <PropertyPanel
            net={net}
            selectedElement={selectedElement}
            onNetUpdate={handleNetUpdate}
            onClose={() => setActiveMode('simulation')}
          />
        );
      default:
        return null;
    }
  };

  const currentMetrics = engine.getMetrics();
  const currentAnalysis = engine.analyzeNet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Factory className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PetriProd</h1>
                  <p className="text-sm text-gray-600">Modélisation de Systèmes de Production</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Activity size={16} className="text-blue-600" />
                  <span className="text-gray-700">Étape:</span>
                  <span className="font-bold text-blue-600">{engine.getSimulationState().step}</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <Zap size={16} className="text-green-600" />
                  <span className="text-gray-700">Produits:</span>
                  <span className="font-bold text-green-600">{currentMetrics.totalProduced}</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                  <BarChart3 size={16} className="text-purple-600" />
                  <span className="text-gray-700">Efficacité:</span>
                  <span className="font-bold text-purple-600">{currentMetrics.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Canvas Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-8">
              <h2 className="text-xl font-bold text-gray-800">Visualisation du Réseau de Petri</h2>
              <div className="flex items-center space-x-4">
                {engine.getEnabledTransitions().length > 0 && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">{engine.getEnabledTransitions().length} transitions activées</span>
                  </div>
                )}
                {engine.getEnabledTransitions().length === 0 && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-semibold">Système bloqué</span>
                  </div>
                )}
                {currentAnalysis.hasDeadlock && (
                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Blocage détecté</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-[600px]">
              <PetriNetCanvas
                net={net}
                onPlaceClick={handlePlaceClick}
                onTransitionClick={handleTransitionClick}
                animatingTransition={animatingTransition}
                scale={canvasTransform.scale}
                offset={canvasTransform.offset}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-96 space-y-6">
            {/* Mode Selector */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Mode de Travail</h3>
              <div className="grid grid-cols-2 gap-3">
                {modes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id)}
                      className={`p-4 rounded-xl text-white transition-all duration-300 transform hover:scale-105 ${
                        activeMode === mode.id 
                          ? `bg-gradient-to-br ${mode.color} ring-4 ring-opacity-30 ring-offset-2 shadow-lg` 
                          : 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                      }`}
                      title={mode.description}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent size={24} />
                        <span className="text-sm font-bold">{mode.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Panel Content */}
            {renderSidePanel()}

            {/* System Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Informations Système</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{net.places.length}</div>
                  <div className="text-sm text-blue-700">Places</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{net.transitions.length}</div>
                  <div className="text-sm text-green-700">Transitions</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{net.arcs.length}</div>
                  <div className="text-sm text-purple-700">Arcs</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {net.places.reduce((sum, place) => sum + place.tokens, 0)}
                  </div>
                  <div className="text-sm text-orange-700">Jetons</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;