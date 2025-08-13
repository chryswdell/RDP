@@ .. @@
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
+  const [autoFit, setAutoFit] = useState(true);
+  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 600 });
 
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
 
+  // Calculate optimal view box to fit all elements
+  useEffect(() => {
+    if (!autoFit) return;
+    
+    const allElements = [...net.places, ...net.transitions];
+    if (allElements.length === 0) return;
+    
+    const padding = 100;
+    const minX = Math.min(...allElements.map(el => el.position.x)) - padding;
+    const maxX = Math.max(...allElements.map(el => el.position.x)) + padding;
+    const minY = Math.min(...allElements.map(el => el.position.y)) - padding;
+    const maxY = Math.max(...allElements.map(el => el.position.y)) + padding;
+    
+    const width = maxX - minX;
+    const height = maxY - minY;
+    
+    setViewBox({ x: minX, y: minY, width, height });
+  }, [net, autoFit]);
+
   useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
 
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
 
     // Clear canvas
     ctx.clearRect(0, 0, canvas.width, canvas.height);
 
-    // Apply transformations
+    // Calculate scale to fit content
+    const scaleX = canvas.width / viewBox.width;
+    const scaleY = canvas.height / viewBox.height;
+    const autoScale = Math.min(scaleX, scaleY, 1.5); // Max scale of 1.5
+    
+    const finalScale = autoFit ? autoScale : scale;
+    const finalOffset = autoFit 
+      ? { x: -viewBox.x * finalScale + (canvas.width - viewBox.width * finalScale) / 2, 
+          y: -viewBox.y * finalScale + (canvas.height - viewBox.height * finalScale) / 2 }
+      : offset;
+
     ctx.save();
-    ctx.translate(offset.x, offset.y);
-    ctx.scale(scale, scale);
+    ctx.translate(finalOffset.x, finalOffset.y);
+    ctx.scale(finalScale, finalScale);
 
     // Draw grid
-    drawGrid(ctx, canvas.width / scale, canvas.height / scale);
+    drawGrid(ctx, viewBox.width, viewBox.height, viewBox.x, viewBox.y);
 
     // Draw arcs first (so they appear behind places and transitions)
     net.arcs.forEach(arc => drawArc(ctx, arc, net));
 
     // Draw places
     net.places.forEach(place => drawPlace(ctx, place));
 
     // Draw transitions
     net.transitions.forEach(transition => drawTransition(ctx, transition, animatingTransition === transition.id));
 
     ctx.restore();
-  }, [net, animatingTransition, scale, offset]);
+  }, [net, animatingTransition, scale, offset, viewBox, autoFit]);
 
-  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
-    const gridSize = 25;
-    ctx.strokeStyle = '#f1f5f9';
+  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, startX: number, startY: number) => {
+    const gridSize = 50;
+    ctx.strokeStyle = '#f8fafc';
     ctx.lineWidth = 1;
 
-    for (let x = 0; x <= width; x += gridSize) {
+    const startGridX = Math.floor(startX / gridSize) * gridSize;
+    const startGridY = Math.floor(startY / gridSize) * gridSize;
+    
+    for (let x = startGridX; x <= startX + width; x += gridSize) {
       ctx.beginPath();
-      ctx.moveTo(x, 0);
-      ctx.lineTo(x, height);
+      ctx.moveTo(x, startY);
+      ctx.lineTo(x, startY + height);
       ctx.stroke();
     }
 
-    for (let y = 0; y <= height; y += gridSize) {
+    for (let y = startGridY; y <= startY + height; y += gridSize) {
       ctx.beginPath();
-      ctx.moveTo(0, y);
-      ctx.lineTo(width, y);
+      ctx.moveTo(startX, y);
+      ctx.lineTo(startX + width, y);
       ctx.stroke();
     }
   };
 
   const drawPlace = (ctx: CanvasRenderingContext2D, place: Place) => {
     const { x, y } = place.position;
-    const radius = 30;
+    const radius = 35;
 
     // Draw shadow
     ctx.beginPath();
-    ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI);
-    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
+    ctx.arc(x + 3, y + 3, radius, 0, 2 * Math.PI);
+    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
     ctx.fill();
 
     // Draw place circle
     ctx.beginPath();
     ctx.arc(x, y, radius, 0, 2 * Math.PI);
-    ctx.fillStyle = place.color || '#e3f2fd';
+    
+    // Create gradient fill
+    const gradient = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, radius);
+    gradient.addColorStop(0, place.color || '#f0f9ff');
+    gradient.addColorStop(1, place.color || '#e0f2fe');
+    ctx.fillStyle = gradient;
     ctx.fill();
+    
     ctx.strokeStyle = '#2563eb';
-    ctx.lineWidth = 2.5;
+    ctx.lineWidth = 3;
     ctx.stroke();
 
     // Draw capacity indicator ring if near full
     if (place.maxCapacity && place.tokens / place.maxCapacity > 0.8) {
       ctx.beginPath();
-      ctx.arc(x, y, radius - 3, 0, 2 * Math.PI);
+      ctx.arc(x, y, radius - 4, 0, 2 * Math.PI);
       ctx.strokeStyle = place.tokens === place.maxCapacity ? '#dc2626' : '#f59e0b';
-      ctx.lineWidth = 2;
+      ctx.lineWidth = 3;
       ctx.stroke();
     }
 
     // Draw tokens
     if (place.tokens > 0) {
       if (place.tokens <= 6) {
         // Draw individual tokens
-        const tokenPositions = getTokenPositions(place.tokens, radius * 0.65);
+        const tokenPositions = getTokenPositions(place.tokens, radius * 0.7);
         tokenPositions.forEach(pos => {
           ctx.beginPath();
-          ctx.arc(x + pos.x, y + pos.y, 4, 0, 2 * Math.PI);
+          ctx.arc(x + pos.x, y + pos.y, 5, 0, 2 * Math.PI);
           ctx.fillStyle = '#1e40af';
           ctx.fill();
           ctx.strokeStyle = '#ffffff';
-          ctx.lineWidth = 1;
+          ctx.lineWidth = 1.5;
           ctx.stroke();
         });
       } else {
         // Draw token count
         ctx.fillStyle = '#1e40af';
-        ctx.font = 'bold 16px Arial';
+        ctx.font = 'bold 18px Arial';
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.fillText(place.tokens.toString(), x, y);
       }
     }
 
     // Draw place name
     ctx.fillStyle = '#374151';
-    ctx.font = '13px Arial';
+    ctx.font = 'bold 14px Arial';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'top';
     const lines = place.name.split(' ');
     lines.forEach((line, index) => {
-      ctx.fillText(line, x, y + radius + 8 + (index * 14));
+      ctx.fillText(line, x, y + radius + 12 + (index * 16));
     });
 
     // Draw capacity indicator if applicable
     if (place.maxCapacity) {
       ctx.fillStyle = '#6b7280';
-      ctx.font = '11px Arial';
-      ctx.fillText(`(${place.tokens}/${place.maxCapacity})`, x, y + radius + 8 + (lines.length * 14));
+      ctx.font = '12px Arial';
+      ctx.fillText(`(${place.tokens}/${place.maxCapacity})`, x, y + radius + 12 + (lines.length * 16));
     }
   };
 
   const getTokenPositions = (tokenCount: number, radius: number): Position[] => {
     const positions: Position[] = [];
     
     if (tokenCount === 1) {
       positions.push({ x: 0, y: 0 });
     } else if (tokenCount === 2) {
-      positions.push({ x: -radius * 0.4, y: 0 });
-      positions.push({ x: radius * 0.4, y: 0 });
+      positions.push({ x: -radius * 0.35, y: 0 });
+      positions.push({ x: radius * 0.35, y: 0 });
     } else if (tokenCount === 3) {
-      positions.push({ x: 0, y: -radius * 0.4 });
-      positions.push({ x: -radius * 0.4, y: radius * 0.4 });
-      positions.push({ x: radius * 0.4, y: radius * 0.4 });
+      positions.push({ x: 0, y: -radius * 0.35 });
+      positions.push({ x: -radius * 0.35, y: radius * 0.35 });
+      positions.push({ x: radius * 0.35, y: radius * 0.35 });
     } else if (tokenCount === 4) {
-      positions.push({ x: -radius * 0.4, y: -radius * 0.4 });
-      positions.push({ x: radius * 0.4, y: -radius * 0.4 });
-      positions.push({ x: -radius * 0.4, y: radius * 0.4 });
-      positions.push({ x: radius * 0.4, y: radius * 0.4 });
+      positions.push({ x: -radius * 0.35, y: -radius * 0.35 });
+      positions.push({ x: radius * 0.35, y: -radius * 0.35 });
+      positions.push({ x: -radius * 0.35, y: radius * 0.35 });
+      positions.push({ x: radius * 0.35, y: radius * 0.35 });
     } else if (tokenCount === 5) {
       positions.push({ x: 0, y: 0 });
-      positions.push({ x: -radius * 0.5, y: -radius * 0.5 });
-      positions.push({ x: radius * 0.5, y: -radius * 0.5 });
-      positions.push({ x: -radius * 0.5, y: radius * 0.5 });
-      positions.push({ x: radius * 0.5, y: radius * 0.5 });
+      positions.push({ x: -radius * 0.45, y: -radius * 0.45 });
+      positions.push({ x: radius * 0.45, y: -radius * 0.45 });
+      positions.push({ x: -radius * 0.45, y: radius * 0.45 });
+      positions.push({ x: radius * 0.45, y: radius * 0.45 });
     } else if (tokenCount === 6) {
-      positions.push({ x: -radius * 0.4, y: -radius * 0.5 });
-      positions.push({ x: 0, y: -radius * 0.5 });
-      positions.push({ x: radius * 0.4, y: -radius * 0.5 });
-      positions.push({ x: -radius * 0.4, y: radius * 0.5 });
-      positions.push({ x: 0, y: radius * 0.5 });
-      positions.push({ x: radius * 0.4, y: radius * 0.5 });
+      positions.push({ x: -radius * 0.35, y: -radius * 0.45 });
+      positions.push({ x: 0, y: -radius * 0.45 });
+      positions.push({ x: radius * 0.35, y: -radius * 0.45 });
+      positions.push({ x: -radius * 0.35, y: radius * 0.45 });
+      positions.push({ x: 0, y: radius * 0.45 });
+      positions.push({ x: radius * 0.35, y: radius * 0.45 });
     }
 
     return positions;
   };
 
   const drawTransition = (ctx: CanvasRenderingContext2D, transition: Transition, isAnimating: boolean) => {
     const { x, y } = transition.position;
-    const width = 50;
-    const height = 12;
+    const width = 60;
+    const height = 15;
 
     // Draw shadow
-    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
-    ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width, height);
+    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
+    ctx.fillRect(x - width / 2 + 3, y - height / 2 + 3, width, height);
 
     // Draw transition rectangle
-    ctx.fillStyle = transition.enabled 
-      ? (isAnimating ? '#f59e0b' : '#16a34a')
-      : '#9ca3af';
+    const gradient = ctx.createLinearGradient(x - width/2, y - height/2, x + width/2, y + height/2);
+    if (transition.enabled) {
+      if (isAnimating) {
+        gradient.addColorStop(0, '#fbbf24');
+        gradient.addColorStop(1, '#f59e0b');
+      } else {
+        gradient.addColorStop(0, '#22c55e');
+        gradient.addColorStop(1, '#16a34a');
+      }
+    } else {
+      gradient.addColorStop(0, '#d1d5db');
+      gradient.addColorStop(1, '#9ca3af');
+    }
+    ctx.fillStyle = gradient;
     ctx.fillRect(x - width / 2, y - height / 2, width, height);
 
     // Draw border
     ctx.strokeStyle = transition.enabled ? '#15803d' : '#6b7280';
-    ctx.lineWidth = 2.5;
+    ctx.lineWidth = 3;
     ctx.strokeRect(x - width / 2, y - height / 2, width, height);
 
     // Draw animation effect
     if (isAnimating) {
       ctx.shadowColor = '#f59e0b';
-      ctx.shadowBlur = 15;
+      ctx.shadowBlur = 20;
       ctx.fillStyle = '#fbbf24';
       ctx.fillRect(x - width / 2, y - height / 2, width, height);
       ctx.shadowBlur = 0;
     }
 
     // Draw transition name
     ctx.fillStyle = '#374151';
-    ctx.font = '13px Arial';
+    ctx.font = 'bold 14px Arial';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'top';
     const lines = transition.name.split(' ');
     lines.forEach((line, index) => {
-      ctx.fillText(line, x, y + height / 2 + 8 + (index * 14));
+      ctx.fillText(line, x, y + height / 2 + 12 + (index * 16));
     });
 
     // Draw delay if specified
     if (transition.delay > 0) {
       ctx.fillStyle = '#6b7280';
-      ctx.font = '11px Arial';
-      ctx.fillText(`${transition.delay}ms`, x, y + height / 2 + 8 + (lines.length * 14));
+      ctx.font = '12px Arial';
+      ctx.fillText(`${transition.delay}ms`, x, y + height / 2 + 12 + (lines.length * 16));
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
-    const fromRadius = arc.type === 'place-to-transition' ? 30 : 25;
-    const toRadius = arc.type === 'place-to-transition' ? 25 : 30;
+    const fromRadius = arc.type === 'place-to-transition' ? 35 : 30;
+    const toRadius = arc.type === 'place-to-transition' ? 30 : 35;
     
     const startX = from.x + unitX * fromRadius;
     const startY = from.y + unitY * fromRadius;
     const endX = to.x - unitX * toRadius;
     const endY = to.y - unitY * toRadius;
 
     // Draw line with gradient
     const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
-    gradient.addColorStop(0, '#6b7280');
-    gradient.addColorStop(1, '#4b5563');
+    gradient.addColorStop(0, '#64748b');
+    gradient.addColorStop(1, '#475569');
 
     ctx.beginPath();
     ctx.moveTo(startX, startY);
     ctx.lineTo(endX, endY);
     ctx.strokeStyle = gradient;
-    ctx.lineWidth = 2.5;
+    ctx.lineWidth = 3;
     ctx.stroke();
 
     // Draw arrowhead
-    const arrowLength = 12;
+    const arrowLength = 15;
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
-    ctx.fillStyle = '#4b5563';
+    ctx.fillStyle = '#475569';
     ctx.fill();
 
     // Draw weight if > 1
     if (arc.weight > 1) {
       const midX = (startX + endX) / 2;
       const midY = (startY + endY) / 2;
       
       // Draw weight background
       ctx.beginPath();
-      ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
+      ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
       ctx.fillStyle = '#ffffff';
       ctx.fill();
       ctx.strokeStyle = '#ef4444';
-      ctx.lineWidth = 2;
+      ctx.lineWidth = 2.5;
       ctx.stroke();
       
       ctx.fillStyle = '#ef4444';
-      ctx.font = 'bold 12px Arial';
+      ctx.font = 'bold 14px Arial';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.fillText(arc.weight.toString(), midX, midY);
     }
   };
 
   const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
     const canvas = canvasRef.current;
     if (!canvas) return;
 
     const rect = canvas.getBoundingClientRect();
-    const x = (event.clientX - rect.left - offset.x) / scale;
-    const y = (event.clientY - rect.top - offset.y) / scale;
+    
+    // Calculate the actual scale and offset being used
+    const scaleX = canvas.width / viewBox.width;
+    const scaleY = canvas.height / viewBox.height;
+    const autoScale = Math.min(scaleX, scaleY, 1.5);
+    const finalScale = autoFit ? autoScale : scale;
+    const finalOffset = autoFit 
+      ? { x: -viewBox.x * finalScale + (canvas.width - viewBox.width * finalScale) / 2, 
+          y: -viewBox.y * finalScale + (canvas.height - viewBox.height * finalScale) / 2 }
+      : offset;
+    
+    const x = (event.clientX - rect.left - finalOffset.x) / finalScale;
+    const y = (event.clientY - rect.top - finalOffset.y) / finalScale;
 
     // Check if clicked on a place
     const clickedPlace = net.places.find(place => {
       const dx = x - place.position.x;
       const dy = y - place.position.y;
-      return Math.sqrt(dx * dx + dy * dy) <= 30;
+      return Math.sqrt(dx * dx + dy * dy) <= 35;
     });
 
     if (clickedPlace && onPlaceClick) {
       onPlaceClick(clickedPlace);
       return;
     }
 
     // Check if clicked on a transition
     const clickedTransition = net.transitions.find(transition => {
       const dx = x - transition.position.x;
       const dy = y - transition.position.y;
-      return Math.abs(dx) <= 25 && Math.abs(dy) <= 6;
+      return Math.abs(dx) <= 30 && Math.abs(dy) <= 8;
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
-    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg overflow-hidden">
+    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-gray-200 rounded-lg overflow-hidden relative">
+      <div className="absolute top-4 right-4 z-10">
+        <button
+          onClick={() => setAutoFit(!autoFit)}
+          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
+            autoFit 
+              ? 'bg-blue-500 text-white shadow-md' 
+              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
+          }`}
+        >
+          {autoFit ? '🔒 Auto-ajusté' : '🔓 Manuel'}
+        </button>
+      </div>
       <canvas
         ref={canvasRef}
         className="w-full h-full cursor-pointer"
         onClick={handleCanvasClick}
         style={{ minHeight: '500px' }}
       />
     </div>
   );
 };