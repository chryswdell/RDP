import React, { useRef, useEffect, useState } from 'react';
import { PetriNet, Place, Transition, Arc, Position } from '../types/PetriNet';

interface PetriNetCanvasProps {
  net: PetriNet;
  onPlaceClick?: (place: Place) => void;
  onTransitionClick?: (transition: Transition) => void;
  onCanvasClick?: (position: Position) => void;
  animatingTransition?: string | null;
  scale?: number;
  offset?: Position;
}

export const PetriNetCanvas: React.FC<PetriNetCanvasProps> = ({
  net,
  onPlaceClick,
  onTransitionClick,
  onCanvasClick,
  animatingTransition,
  scale = 1,
  offset = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw grid
    drawGrid(ctx, canvas.width / scale, canvas.height / scale);

    // Draw arcs first (so they appear behind places and transitions)
    net.arcs.forEach(arc => drawArc(ctx, arc, net));

    // Draw places
    net.places.forEach(place => drawPlace(ctx, place));

    // Draw transitions
    net.transitions.forEach(transition => drawTransition(ctx, transition, animatingTransition === transition.id));

    ctx.restore();
  }, [net, animatingTransition, scale, offset]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 25;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawPlace = (ctx: CanvasRenderingContext2D, place: Place) => {
    const { x, y } = place.position;
    const radius = 30;

    // Draw shadow
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();

    // Draw place circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = place.color || '#e3f2fd';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw capacity indicator ring if near full
    if (place.maxCapacity && place.tokens / place.maxCapacity > 0.8) {
      ctx.beginPath();
      ctx.arc(x, y, radius - 3, 0, 2 * Math.PI);
      ctx.strokeStyle = place.tokens === place.maxCapacity ? '#dc2626' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw tokens
    if (place.tokens > 0) {
      if (place.tokens <= 6) {
        // Draw individual tokens
        const tokenPositions = getTokenPositions(place.tokens, radius * 0.65);
        tokenPositions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(x + pos.x, y + pos.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#1e40af';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      } else {
        // Draw token count
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(place.tokens.toString(), x, y);
      }
    }

    // Draw place name
    ctx.fillStyle = '#374151';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = place.name.split(' ');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + radius + 8 + (index * 14));
    });

    // Draw capacity indicator if applicable
    if (place.maxCapacity) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.fillText(`(${place.tokens}/${place.maxCapacity})`, x, y + radius + 8 + (lines.length * 14));
    }
  };

  const getTokenPositions = (tokenCount: number, radius: number): Position[] => {
    const positions: Position[] = [];
    
    if (tokenCount === 1) {
      positions.push({ x: 0, y: 0 });
    } else if (tokenCount === 2) {
      positions.push({ x: -radius * 0.4, y: 0 });
      positions.push({ x: radius * 0.4, y: 0 });
    } else if (tokenCount === 3) {
      positions.push({ x: 0, y: -radius * 0.4 });
      positions.push({ x: -radius * 0.4, y: radius * 0.4 });
      positions.push({ x: radius * 0.4, y: radius * 0.4 });
    } else if (tokenCount === 4) {
      positions.push({ x: -radius * 0.4, y: -radius * 0.4 });
      positions.push({ x: radius * 0.4, y: -radius * 0.4 });
      positions.push({ x: -radius * 0.4, y: radius * 0.4 });
      positions.push({ x: radius * 0.4, y: radius * 0.4 });
    } else if (tokenCount === 5) {
      positions.push({ x: 0, y: 0 });
      positions.push({ x: -radius * 0.5, y: -radius * 0.5 });
      positions.push({ x: radius * 0.5, y: -radius * 0.5 });
      positions.push({ x: -radius * 0.5, y: radius * 0.5 });
      positions.push({ x: radius * 0.5, y: radius * 0.5 });
    } else if (tokenCount === 6) {
      positions.push({ x: -radius * 0.4, y: -radius * 0.5 });
      positions.push({ x: 0, y: -radius * 0.5 });
      positions.push({ x: radius * 0.4, y: -radius * 0.5 });
      positions.push({ x: -radius * 0.4, y: radius * 0.5 });
      positions.push({ x: 0, y: radius * 0.5 });
      positions.push({ x: radius * 0.4, y: radius * 0.5 });
    }

    return positions;
  };

  const drawTransition = (ctx: CanvasRenderingContext2D, transition: Transition, isAnimating: boolean) => {
    const { x, y } = transition.position;
    const width = 50;
    const height = 12;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width, height);

    // Draw transition rectangle
    ctx.fillStyle = transition.enabled 
      ? (isAnimating ? '#f59e0b' : '#16a34a')
      : '#9ca3af';
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Draw border
    ctx.strokeStyle = transition.enabled ? '#15803d' : '#6b7280';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    // Draw animation effect
    if (isAnimating) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - width / 2, y - height / 2, width, height);
      ctx.shadowBlur = 0;
    }

    // Draw transition name
    ctx.fillStyle = '#374151';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = transition.name.split(' ');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + height / 2 + 8 + (index * 14));
    });

    // Draw delay if specified
    if (transition.delay > 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.fillText(`${transition.delay}ms`, x, y + height / 2 + 8 + (lines.length * 14));
    }
  };

  const drawArc = (ctx: CanvasRenderingContext2D, arc: Arc, net: PetriNet) => {
    const fromElement = arc.type === 'place-to-transition' 
      ? net.places.find(p => p.id === arc.from)
      : net.transitions.find(t => t.id === arc.from);
    
    const toElement = arc.type === 'place-to-transition'
      ? net.transitions.find(t => t.id === arc.to)
      : net.places.find(p => p.id === arc.to);

    if (!fromElement || !toElement) return;

    const from = fromElement.position;
    const to = toElement.position;

    // Calculate arrow points
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return;

    const unitX = dx / length;
    const unitY = dy / length;

    // Adjust start and end points to avoid overlap with elements
    const fromRadius = arc.type === 'place-to-transition' ? 30 : 25;
    const toRadius = arc.type === 'place-to-transition' ? 25 : 30;
    
    const startX = from.x + unitX * fromRadius;
    const startY = from.y + unitY * fromRadius;
    const endX = to.x - unitX * toRadius;
    const endY = to.y - unitY * toRadius;

    // Draw line with gradient
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, '#6b7280');
    gradient.addColorStop(1, '#4b5563');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw arrowhead
    const arrowLength = 12;
    const arrowAngle = Math.PI / 5;
    
    const arrowX1 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) - arrowAngle);
    const arrowY1 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) - arrowAngle);
    const arrowX2 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) + arrowAngle);
    const arrowY2 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) + arrowAngle);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.closePath();
    ctx.fillStyle = '#4b5563';
    ctx.fill();

    // Draw weight if > 1
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
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(arc.weight.toString(), midX, midY);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    // Check if clicked on a place
    const clickedPlace = net.places.find(place => {
      const dx = x - place.position.x;
      const dy = y - place.position.y;
      return Math.sqrt(dx * dx + dy * dy) <= 30;
    });

    if (clickedPlace && onPlaceClick) {
      onPlaceClick(clickedPlace);
      return;
    }

    // Check if clicked on a transition
    const clickedTransition = net.transitions.find(transition => {
      const dx = x - transition.position.x;
      const dy = y - transition.position.y;
      return Math.abs(dx) <= 25 && Math.abs(dy) <= 6;
    });

    if (clickedTransition && onTransitionClick) {
      onTransitionClick(clickedTransition);
      return;
    }

    // Empty canvas click
    if (onCanvasClick) {
      onCanvasClick({ x, y });
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};