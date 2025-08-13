import { PetriNet, Place, Transition, Arc, SimulationState, Analysis, ProductionMetrics } from '../types/PetriNet';

export class PetriNetEngine {
  private net: PetriNet;
  private simulationState: SimulationState;
  private history: PetriNet[] = [];
  private metrics: ProductionMetrics;
  private startTime: number = Date.now();
  private transitionFireCount: { [transitionId: string]: number } = {};

  constructor(net: PetriNet) {
    this.net = net;
    this.simulationState = {
      isRunning: false,
      step: 0,
      speed: 1000,
      history: [this.cloneNet()]
    };
    this.metrics = {
      totalProduced: 0,
      averageWaitTime: 0,
      resourceUtilization: {},
      bottlenecks: [],
      cycleTime: 0,
      efficiency: 0
    };
    this.initializeTransitionCounts();
  }

  private cloneNet(): PetriNet {
    return JSON.parse(JSON.stringify(this.net));
  }

  private initializeTransitionCounts(): void {
    this.net.transitions.forEach(transition => {
      this.transitionFireCount[transition.id] = 0;
    });
  }

  public getNet(): PetriNet {
    return this.net;
  }

  public getSimulationState(): SimulationState {
    return this.simulationState;
  }

  public getMetrics(): ProductionMetrics {
    return this.metrics;
  }

  public isTransitionEnabled(transitionId: string): boolean {
    const transition = this.net.transitions.find(t => t.id === transitionId);
    if (!transition) return false;

    const inputArcs = this.net.arcs.filter(arc => 
      arc.to === transitionId && arc.type === 'place-to-transition'
    );

    return inputArcs.every(arc => {
      const place = this.net.places.find(p => p.id === arc.from);
      return place && place.tokens >= arc.weight;
    });
  }

  public getEnabledTransitions(): string[] {
    return this.net.transitions
      .filter(t => this.isTransitionEnabled(t.id))
      .map(t => t.id);
  }

  public fireTransition(transitionId: string): boolean {
    if (!this.isTransitionEnabled(transitionId)) return false;

    // Save current state to history
    this.history.push(this.cloneNet());
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Remove tokens from input places
    const inputArcs = this.net.arcs.filter(arc => 
      arc.to === transitionId && arc.type === 'place-to-transition'
    );
    
    inputArcs.forEach(arc => {
      const place = this.net.places.find(p => p.id === arc.from);
      if (place) {
        place.tokens -= arc.weight;
      }
    });

    // Add tokens to output places
    const outputArcs = this.net.arcs.filter(arc => 
      arc.from === transitionId && arc.type === 'transition-to-place'
    );
    
    outputArcs.forEach(arc => {
      const place = this.net.places.find(p => p.id === arc.to);
      if (place) {
        place.tokens += arc.weight;
        if (place.maxCapacity && place.tokens > place.maxCapacity) {
          place.tokens = place.maxCapacity;
        }
      }
    });

    // Update enabled states
    this.updateTransitionStates();
    this.simulationState.step++;
    this.transitionFireCount[transitionId]++;

    // Update metrics
    this.updateMetrics(transitionId);

    return true;
  }

  private updateTransitionStates(): void {
    this.net.transitions.forEach(transition => {
      transition.enabled = this.isTransitionEnabled(transition.id);
    });
  }

  private updateMetrics(firedTransitionId: string): void {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;

    // Update production count for finishing transitions
    if (firedTransitionId.includes('finish') || 
        firedTransitionId.includes('complete') || 
        firedTransitionId.includes('fin')) {
      this.metrics.totalProduced++;
    }

    // Calculate cycle time
    if (this.metrics.totalProduced > 0) {
      this.metrics.cycleTime = elapsedTime / this.metrics.totalProduced;
    }

    // Calculate resource utilization
    this.net.places.forEach(place => {
      if (place.name.toLowerCase().includes('resource') || 
          place.name.toLowerCase().includes('machine') ||
          place.name.toLowerCase().includes('station') ||
          place.name.toLowerCase().includes('occup')) {
        const maxCapacity = place.maxCapacity || 1;
        const utilization = place.tokens / maxCapacity;
        this.metrics.resourceUtilization[place.id] = utilization;
      }
    });

    // Calculate efficiency
    const totalCapacity = Object.values(this.metrics.resourceUtilization).length;
    const averageUtilization = totalCapacity > 0 
      ? Object.values(this.metrics.resourceUtilization).reduce((sum, util) => sum + util, 0) / totalCapacity
      : 0;
    this.metrics.efficiency = averageUtilization * 100;

    // Identify bottlenecks
    this.metrics.bottlenecks = this.identifyBottlenecks();

    // Calculate average wait time (simplified)
    this.metrics.averageWaitTime = this.calculateAverageWaitTime();
  }

  private identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];
    
    // A place is a bottleneck if it's consistently empty and blocks transitions
    this.net.places.forEach(place => {
      if (place.tokens === 0) {
        const outputArcs = this.net.arcs.filter(arc => 
          arc.from === place.id && arc.type === 'place-to-transition'
        );
        
        const blockedTransitions = outputArcs.filter(arc => {
          const transition = this.net.transitions.find(t => t.id === arc.to);
          return transition && !transition.enabled;
        });

        if (blockedTransitions.length > 0) {
          bottlenecks.push(place.id);
        }
      }
    });

    return bottlenecks;
  }

  private calculateAverageWaitTime(): number {
    // Simplified calculation based on buffer sizes and throughput
    const bufferPlaces = this.net.places.filter(place => 
      place.name.toLowerCase().includes('buffer') || 
      place.name.toLowerCase().includes('tampon') ||
      place.name.toLowerCase().includes('stock')
    );

    if (bufferPlaces.length === 0) return 0;

    const totalWaitTime = bufferPlaces.reduce((sum, place) => {
      return sum + (place.tokens * 100); // Simplified wait time calculation
    }, 0);

    return totalWaitTime / bufferPlaces.length;
  }

  public analyzeNet(): Analysis {
    const analysis: Analysis = {
      isLive: this.checkLiveness(),
      isBounded: this.checkBoundedness(),
      hasDeadlock: this.checkDeadlock(),
      conflicts: this.findConflicts(),
      maxTokens: this.calculateMaxTokens(),
      throughput: this.calculateThroughput()
    };

    return analysis;
  }

  private checkLiveness(): boolean {
    // Simplified liveness check: all transitions should be potentially fireable
    return this.net.transitions.every(transition => {
      const inputArcs = this.net.arcs.filter(arc => 
        arc.to === transition.id && arc.type === 'place-to-transition'
      );
      return inputArcs.length > 0;
    });
  }

  private checkBoundedness(): boolean {
    // Check if all places have finite capacity
    return this.net.places.every(place => {
      return place.maxCapacity !== undefined && place.maxCapacity > 0;
    });
  }

  private checkDeadlock(): boolean {
    return this.getEnabledTransitions().length === 0;
  }

  private findConflicts(): string[] {
    const conflicts: string[] = [];
    
    this.net.places.forEach(place => {
      const outputTransitions = this.net.arcs
        .filter(arc => arc.from === place.id && arc.type === 'place-to-transition')
        .map(arc => arc.to);
      
      if (outputTransitions.length > 1) {
        const transitionNames = outputTransitions.map(id => {
          const transition = this.net.transitions.find(t => t.id === id);
          return transition ? transition.name : id;
        });
        conflicts.push(`Place "${place.name}" crée un conflit entre: ${transitionNames.join(', ')}`);
      }
    });

    return conflicts;
  }

  private calculateMaxTokens(): { [placeId: string]: number } {
    const maxTokens: { [placeId: string]: number } = {};
    
    this.net.places.forEach(place => {
      maxTokens[place.id] = Math.max(place.tokens, place.maxCapacity || place.tokens);
    });

    return maxTokens;
  }

  private calculateThroughput(): { [transitionId: string]: number } {
    const throughput: { [transitionId: string]: number } = {};
    const totalFires = Object.values(this.transitionFireCount).reduce((sum, count) => sum + count, 0);
    
    this.net.transitions.forEach(transition => {
      const fireCount = this.transitionFireCount[transition.id] || 0;
      throughput[transition.id] = totalFires > 0 ? fireCount / totalFires : 0;
    });

    return throughput;
  }

  public reset(): void {
    if (this.history.length > 0) {
      const initialState = this.history[0];
      this.net = JSON.parse(JSON.stringify(initialState));
    }
    
    this.simulationState.step = 0;
    this.simulationState.isRunning = false;
    this.startTime = Date.now();
    this.transitionFireCount = {};
    this.initializeTransitionCounts();
    
    this.metrics = {
      totalProduced: 0,
      averageWaitTime: 0,
      resourceUtilization: {},
      bottlenecks: [],
      cycleTime: 0,
      efficiency: 0
    };
    
    this.updateTransitionStates();
  }

  public stepBack(): boolean {
    if (this.history.length > 1) {
      this.history.pop();
      const previousState = this.history[this.history.length - 1];
      this.net = JSON.parse(JSON.stringify(previousState));
      this.simulationState.step = Math.max(0, this.simulationState.step - 1);
      this.updateTransitionStates();
      return true;
    }
    return false;
  }

  public updateNet(net: PetriNet): void {
    this.net = net;
    this.updateTransitionStates();
    this.initializeTransitionCounts();
  }
}