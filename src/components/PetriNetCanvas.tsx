import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { PetriNet, Place, Transition, Arc, Position } from '../types/PetriNet';

interface PetriNetVisualizerProps {
  net: PetriNet;
  onPlaceClick?: (place: Place) => void;
  onTransitionClick?: (transition: Transition) => void;
  animatingTransition?: string | null;
  scale?: number;
  offset?: Position;
}

const PetriNetVisualizer: React.FC<PetriNetVisualizerProps> = ({
  net,
  onPlaceClick,
  onTransitionClick,
  animatingTransition,
  scale = 1,
  offset = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [currentScale, setCurrentScale] = useState(scale);
  const [currentOffset, setCurrentOffset] = useState(offset);

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Auto-fit functionality
  const autoFitToContent = () => {
    if (net.places.length === 0 && net.transitions.length === 0) return;

    const allElements = [
      ...net.places.map(p => p.position),
      ...net.transitions.map(t => t.position)
    ];

    const minX = Math.min(...allElements.map(p => p.x)) - 100;
    const maxX = Math.max(...allElements.map(p => p.x)) + 100;
    const minY = Math.min(...allElements.map(p => p.y)) - 100;
    const maxY = Math.max(...allElements.map(p => p.y)) + 100;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = canvasSize.width / contentWidth;
    const scaleY = canvasSize.height / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.5) * 0.9; // 90% to add padding

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newOffsetX = canvasSize.width / 2 - centerX * newScale;
    const newOffsetY = canvasSize.height / 2 - centerY * newScale;

    setCurrentScale(newScale);
    setCurrentOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Initialize auto-fit on mount and when net changes
  useEffect(() => {
    setTimeout(autoFitToContent, 100);
  }, [net, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(currentOffset.x, currentOffset.y);
    ctx.scale(currentScale, currentScale);

    // Draw grid
    drawGrid(ctx, canvas.width / currentScale, canvas.height / currentScale);

    // Draw arcs first (so they appear behind places and transitions)
    net.arcs.forEach(arc => drawArc(ctx, arc));

    // Draw places
    net.places.forEach(place => drawPlace(ctx, place));

    // Draw transitions
    net.transitions.forEach(transition => 
      drawTransition(ctx, transition, animatingTransition === transition.id)
    );

    ctx.restore();
  }, [net, animatingTransition, currentScale, currentOffset]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 50;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawPlace = (ctx: CanvasRenderingContext2D, place: Place) => {
    const { x, y } = place.position;
    const radius = 35;

    // Draw shadow
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    // Draw place circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, radius);
    gradient.addColorStop(0, place.color || '#f0f9ff');
    gradient.addColorStop(1, place.color || '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw tokens
    if (place.tokens > 0) {
      if (place.tokens <= 5) {
        // Draw individual tokens
        const tokenRadius = 4;
        const positions = getTokenPositions(place.tokens, radius - 8);
        
        positions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(x + pos.x, y + pos.y, tokenRadius, 0, 2 * Math.PI);
          ctx.fillStyle = '#1f2937';
          ctx.fill();
        });
      } else {
        // Draw token count as text
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(place.tokens.toString(), x, y + 5);
      }
    }

    // Draw place name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const lines = place.name.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + radius + 20 + (index * 14));
    });

    // Draw capacity indicator if applicable
    if (place.maxCapacity) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`(${place.tokens}/${place.maxCapacity})`, x, y + radius + 8 + (lines.length * 14));
    }
  };

  const drawTransition = (ctx: CanvasRenderingContext2D, transition: Transition, isAnimating: boolean) => {
    const { x, y } = transition.position;
    const width = 60;
    const height = 15;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width, height);

    // Draw transition rectangle
    const gradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
    if (transition.enabled) {
      if (isAnimating) {
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
      } else {
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#16a34a');
      }
    } else {
      gradient.addColorStop(0, '#d1d5db');
      gradient.addColorStop(1, '#9ca3af');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Draw border
    ctx.strokeStyle = transition.enabled ? '#166534' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    // Draw transition name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const lines = transition.name.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + height / 2 + 20 + (index * 14));
    });

    // Draw delay if specified
    if (transition.delay > 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${transition.delay}ms`, x, y + height / 2 + 8 + (lines.length * 14));
    }
  };

  const drawArc = (ctx: CanvasRenderingContext2D, arc: Arc) => {
    const fromElement = arc.type === 'place-to-transition' 
      ? net.places.find(p => p.id === arc.from)
      : net.transitions.find(t => t.id === arc.from);
    
    const toElement = arc.type === 'place-to-transition'
      ? net.transitions.find(t => t.id === arc.to)
      : net.places.find(p => p.id === arc.to);

    if (!fromElement || !toElement) return;

    const from = fromElement.position;
    const to = toElement.position;

    // Calculate direction vector
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return;

    const unitX = dx / length;
    const unitY = dy / length;

    // Adjust start and end points to avoid overlap with elements
    const fromRadius = arc.type === 'place-to-transition' ? 35 : 30;
    const toRadius = arc.type === 'place-to-transition' ? 30 : 35;
    
    const startX = from.x + unitX * fromRadius;
    const startY = from.y + unitY * fromRadius;
    const endX = to.x - unitX * toRadius;
    const endY = to.y - unitY * toRadius;

    // Create gradient for the arc
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, '#64748b');
    gradient.addColorStop(1, '#334155');

    // Draw arc line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw arrowhead
    const arrowLength = 12;
    const arrowAngle = Math.PI / 6;
    
    const arrowX1 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) - arrowAngle);
    const arrowY1 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) - arrowAngle);
    const arrowX2 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) + arrowAngle);
    const arrowY2 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) + arrowAngle);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw weight if greater than 1
    if (arc.weight > 1) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Draw weight background
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw weight text
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(arc.weight.toString(), midX, midY + 4);
    }
  };

  const getTokenPositions = (tokenCount: number, radius: number): Position[] => {
    const positions: Position[] = [];
    
    if (tokenCount === 1) {
      positions.push({ x: 0, y: 0 });
    } else if (tokenCount === 2) {
      positions.push({ x: -radius/3, y: 0 });
      positions.push({ x: radius/3, y: 0 });
    } else if (tokenCount === 3) {
      positions.push({ x: 0, y: -radius/3 });
      positions.push({ x: -radius/3, y: radius/3 });
      positions.push({ x: radius/3, y: radius/3 });
    } else if (tokenCount === 4) {
      positions.push({ x: -radius/3, y: -radius/3 });
      positions.push({ x: radius/3, y: -radius/3 });
      positions.push({ x: -radius/3, y: radius/3 });
      positions.push({ x: radius/3, y: radius/3 });
    } else if (tokenCount === 5) {
      positions.push({ x: 0, y: 0 });
      positions.push({ x: -radius/2, y: -radius/2 });
      positions.push({ x: radius/2, y: -radius/2 });
      positions.push({ x: -radius/2, y: radius/2 });
      positions.push({ x: radius/2, y: radius/2 });
    }
    
    return positions;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - currentOffset.x) / currentScale;
    const y = (event.clientY - rect.top - currentOffset.y) / currentScale;

    // Check if clicked on a place
    const clickedPlace = net.places.find(place => {
      const dx = x - place.position.x;
      const dy = y - place.position.y;
      return Math.sqrt(dx * dx + dy * dy) <= 35;
    });

    if (clickedPlace && onPlaceClick) {
      onPlaceClick(clickedPlace);
      return;
    }

    // Check if clicked on a transition
    const clickedTransition = net.transitions.find(transition => {
      const dx = x - transition.position.x;
      const dy = y - transition.position.y;
      return Math.abs(dx) <= 30 && Math.abs(dy) <= 8;
    });

    if (clickedTransition && onTransitionClick) {
      onTransitionClick(clickedTransition);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;

    setCurrentOffset({
      x: currentOffset.x + deltaX,
      y: currentOffset.y + deltaY
    });

    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, currentScale * scaleFactor));

    // Zoom towards mouse position
    const worldX = (mouseX - currentOffset.x) / currentScale;
    const worldY = (mouseY - currentOffset.y) / currentScale;

    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;

    setCurrentScale(newScale);
    setCurrentOffset({ x: newOffsetX, y: newOffsetY });
  };

  const zoomIn = () => {
    const newScale = Math.min(3, currentScale * 1.2);
    setCurrentScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, currentScale * 0.8);
    setCurrentScale(newScale);
  };

  const resetView = () => {
    autoFitToContent();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg overflow-hidden relative">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={zoomIn}
          className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md hover:bg-white transition-all duration-200"
          title="Zoom avant"
        >
          <ZoomIn size={18} className="text-gray-700" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md hover:bg-white transition-all duration-200"
          title="Zoom arrière"
        >
          <ZoomOut size={18} className="text-gray-700" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md hover:bg-white transition-all duration-200"
          title="Ajuster à la vue"
        >
          <Maximize2 size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-600">
        {Math.round(currentScale * 100)}%
      </div>

      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};

export default PetriNetVisualizer;