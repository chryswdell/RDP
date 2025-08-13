@@ .. @@
           {/* Main Canvas Area */}
-          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
-            <div className="h-20 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-8">
+          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-0">
+            <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
               <h2 className="text-xl font-bold text-gray-800">Visualisation du Réseau de Petri</h2>
               <div className="flex items-center space-x-4">
                 {engine.getEnabledTransitions().length > 0 && (
-                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
+                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
-                    <span className="text-sm font-semibold">{engine.getEnabledTransitions().length} transitions activées</span>
+                    <span className="text-xs font-semibold">{engine.getEnabledTransitions().length} activées</span>
                   </div>
                 )}
                 {engine.getEnabledTransitions().length === 0 && (
-                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full">
+                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                     <div className="w-2 h-2 bg-red-500 rounded-full"></div>
-                    <span className="text-sm font-semibold">Système bloqué</span>
+                    <span className="text-xs font-semibold">Bloqué</span>
                   </div>
                 )}
                 {currentAnalysis.hasDeadlock && (
-                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full">
+                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                     <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
-                    <span className="text-sm font-semibold">Blocage détecté</span>
+                    <span className="text-xs font-semibold">Deadlock</span>
                   </div>
                 )}
               </div>
             </div>
             
-            <div className="h-[600px]">
+            <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 280px)' }}>
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
-          <div className="w-96 space-y-6">
+          <div className="w-80 space-y-4 flex-shrink-0">
             {/* Mode Selector */}
-            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
-              <h3 className="text-xl font-bold text-gray-800 mb-4">Mode de Travail</h3>
-              <div className="grid grid-cols-2 gap-3">
+            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
+              <h3 className="text-lg font-bold text-gray-800 mb-3">Mode de Travail</h3>
+              <div className="grid grid-cols-2 gap-2">
                 {modes.map((mode) => {
                   const IconComponent = mode.icon;
                   return (
                     <button
                       key={mode.id}
                       onClick={() => setActiveMode(mode.id)}
-                      className={`p-4 rounded-xl text-white transition-all duration-300 transform hover:scale-105 ${
+                      className={`p-3 rounded-lg text-white transition-all duration-200 transform hover:scale-105 ${
                         activeMode === mode.id 
-                          ? `bg-gradient-to-br ${mode.color} ring-4 ring-opacity-30 ring-offset-2 shadow-lg` 
+                          ? `bg-gradient-to-br ${mode.color} ring-2 ring-opacity-30 ring-offset-1 shadow-md` 
                           : 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                       }`}
                       title={mode.description}
                     >
                       <div className="flex flex-col items-center space-y-2">
-                        <IconComponent size={24} />
-                        <span className="text-sm font-bold">{mode.label}</span>
+                        <IconComponent size={20} />
+                        <span className="text-xs font-bold">{mode.label}</span>
                       </div>
                     </button>
                   );
@@ -464,19 +464,19 @@
             {renderSidePanel()}
 
             {/* System Info */}
-            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
-              <h3 className="text-xl font-bold text-gray-800 mb-4">Informations Système</h3>
-              <div className="grid grid-cols-2 gap-4">
-                <div className="bg-blue-50 p-3 rounded-lg">
-                  <div className="text-2xl font-bold text-blue-600">{net.places.length}</div>
+            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
+              <h3 className="text-lg font-bold text-gray-800 mb-3">Informations Système</h3>
+              <div className="grid grid-cols-2 gap-3">
+                <div className="bg-blue-50 p-2 rounded-lg">
+                  <div className="text-xl font-bold text-blue-600">{net.places.length}</div>
                   <div className="text-sm text-blue-700">Places</div>
                 </div>
-                <div className="bg-green-50 p-3 rounded-lg">
-                  <div className="text-2xl font-bold text-green-600">{net.transitions.length}</div>
+                <div className="bg-green-50 p-2 rounded-lg">
+                  <div className="text-xl font-bold text-green-600">{net.transitions.length}</div>
                   <div className="text-sm text-green-700">Transitions</div>
                 </div>
-                <div className="bg-purple-50 p-3 rounded-lg">
-                  <div className="text-2xl font-bold text-purple-600">{net.arcs.length}</div>
+                <div className="bg-purple-50 p-2 rounded-lg">
+                  <div className="text-xl font-bold text-purple-600">{net.arcs.length}</div>
                   <div className="text-sm text-purple-700">Arcs</div>
                 </div>
-                <div className="bg-orange-50 p-3 rounded-lg">
-                  <div className="text-2xl font-bold text-orange-600">
+                <div className="bg-orange-50 p-2 rounded-lg">
+                  <div className="text-xl font-bold text-orange-600">
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