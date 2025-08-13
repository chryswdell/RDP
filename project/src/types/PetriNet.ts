export interface Position {
  x: number;
  y: number;
}

export interface Place {
  id: string;
  name: string;
  position: Position;
  tokens: number;
  maxCapacity?: number;
  color: string;
}

export interface Transition {
  id: string;
  name: string;
  position: Position;
  enabled: boolean;
  delay: number;
  color: string;
}

export interface Arc {
  id: string;
  from: string;
  to: string;
  weight: number;
  type: 'place-to-transition' | 'transition-to-place';
}

export interface PetriNet {
  places: Place[];
  transitions: Transition[];
  arcs: Arc[];
}

export interface SimulationState {
  isRunning: boolean;
  step: number;
  speed: number;
  history: PetriNet[];
}

export interface Analysis {
  isLive: boolean;
  isBounded: boolean;
  hasDeadlock: boolean;
  conflicts: string[];
  maxTokens: { [placeId: string]: number };
  throughput: { [transitionId: string]: number };
}

export interface ProductionMetrics {
  totalProduced: number;
  averageWaitTime: number;
  resourceUtilization: { [resourceId: string]: number };
  bottlenecks: string[];
  cycleTime: number;
  efficiency: number;
}