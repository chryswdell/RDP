import React, { useState } from 'react';
import { Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { PetriNet, Place, Transition, Arc } from '../types/PetriNet';

interface PropertyPanelProps {
  net: PetriNet;
  selectedElement?: { type: 'place' | 'transition' | 'arc'; id: string } | null;
  onNetUpdate: (net: PetriNet) => void;
  onClose: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  net,
  selectedElement,
  onNetUpdate,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({});

  const getSelectedData = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case 'place':
        return net.places.find(p => p.id === selectedElement.id);
      case 'transition':
        return net.transitions.find(t => t.id === selectedElement.id);
      case 'arc':
        return net.arcs.find(a => a.id === selectedElement.id);
      default:
        return null;
    }
  };

  const startEditing = () => {
    const element = getSelectedData();
    if (element) {
      setEditValues({ ...element });
      setIsEditing(true);
    }
  };

  const saveChanges = () => {
    if (!selectedElement) return;

    const updatedNet = { ...net };
    
    switch (selectedElement.type) {
      case 'place':
        const placeIndex = updatedNet.places.findIndex(p => p.id === selectedElement.id);
        if (placeIndex >= 0) {
          updatedNet.places[placeIndex] = { ...editValues };
        }
        break;
      case 'transition':
        const transitionIndex = updatedNet.transitions.findIndex(t => t.id === selectedElement.id);
        if (transitionIndex >= 0) {
          updatedNet.transitions[transitionIndex] = { ...editValues };
        }
        break;
      case 'arc':
        const arcIndex = updatedNet.arcs.findIndex(a => a.id === selectedElement.id);
        if (arcIndex >= 0) {
          updatedNet.arcs[arcIndex] = { ...editValues };
        }
        break;
    }

    onNetUpdate(updatedNet);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const deleteElement = () => {
    if (!selectedElement || !confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    const updatedNet = { ...net };
    
    switch (selectedElement.type) {
      case 'place':
        updatedNet.places = updatedNet.places.filter(p => p.id !== selectedElement.id);
        // Remove related arcs
        updatedNet.arcs = updatedNet.arcs.filter(a => a.from !== selectedElement.id && a.to !== selectedElement.id);
        break;
      case 'transition':
        updatedNet.transitions = updatedNet.transitions.filter(t => t.id !== selectedElement.id);
        // Remove related arcs
        updatedNet.arcs = updatedNet.arcs.filter(a => a.from !== selectedElement.id && a.to !== selectedElement.id);
        break;
      case 'arc':
        updatedNet.arcs = updatedNet.arcs.filter(a => a.id !== selectedElement.id);
        break;
    }

    onNetUpdate(updatedNet);
    onClose();
  };

  const renderPlaceProperties = (place: Place) => (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom:</label>
            <input
              type="text"
              value={editValues.name || ''}
              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jetons:</label>
            <input
              type="number"
              min="0"
              value={editValues.tokens || 0}
              onChange={(e) => setEditValues({ ...editValues, tokens: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité Max:</label>
            <input
              type="number"
              min="1"
              value={editValues.maxCapacity || ''}
              onChange={(e) => setEditValues({ ...editValues, maxCapacity: parseInt(e.target.value) || undefined })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Illimitée"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur:</label>
            <input
              type="color"
              value={editValues.color || '#e3f2fd'}
              onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Nom:</span>
            <span className="text-sm text-gray-900">{place.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Jetons:</span>
            <span className="text-sm text-gray-900">{place.tokens}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Capacité Max:</span>
            <span className="text-sm text-gray-900">{place.maxCapacity || 'Illimitée'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Position:</span>
            <span className="text-sm text-gray-900">({place.position.x}, {place.position.y})</span>
          </div>
        </>
      )}
    </div>
  );

  const renderTransitionProperties = (transition: Transition) => (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom:</label>
            <input
              type="text"
              value={editValues.name || ''}
              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Délai (ms):</label>
            <input
              type="number"
              min="0"
              value={editValues.delay || 0}
              onChange={(e) => setEditValues({ ...editValues, delay: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur:</label>
            <input
              type="color"
              value={editValues.color || '#16a34a'}
              onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Nom:</span>
            <span className="text-sm text-gray-900">{transition.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">État:</span>
            <span className={`text-sm font-medium ${transition.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {transition.enabled ? 'Activée' : 'Désactivée'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Délai:</span>
            <span className="text-sm text-gray-900">{transition.delay}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Position:</span>
            <span className="text-sm text-gray-900">({transition.position.x}, {transition.position.y})</span>
          </div>
        </>
      )}
    </div>
  );

  const renderArcProperties = (arc: Arc) => {
    const fromElement = arc.type === 'place-to-transition' 
      ? net.places.find(p => p.id === arc.from)
      : net.transitions.find(t => t.id === arc.from);
    const toElement = arc.type === 'place-to-transition'
      ? net.transitions.find(t => t.id === arc.to)
      : net.places.find(p => p.id === arc.to);

    return (
      <div className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poids:</label>
            <input
              type="number"
              min="1"
              value={editValues.weight || 1}
              onChange={(e) => setEditValues({ ...editValues, weight: parseInt(e.target.value) || 1 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <span className="text-sm text-gray-900">
                {arc.type === 'place-to-transition' ? 'Place → Transition' : 'Transition → Place'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">De:</span>
              <span className="text-sm text-gray-900">{fromElement?.name || arc.from}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Vers:</span>
              <span className="text-sm text-gray-900">{toElement?.name || arc.to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Poids:</span>
              <span className="text-sm text-gray-900">{arc.weight}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const selectedData = getSelectedData();

  if (!selectedElement || !selectedData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center text-gray-500 py-8">
          <Edit3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucun élément sélectionné</p>
          <p className="text-sm">Cliquez sur une place, transition ou arc pour voir ses propriétés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Edit3 className="text-blue-500" size={20} />
          <span>Propriétés - {selectedElement.type === 'place' ? 'Place' : selectedElement.type === 'transition' ? 'Transition' : 'Arc'}</span>
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Properties */}
        <div>
          {selectedElement.type === 'place' && renderPlaceProperties(selectedData as Place)}
          {selectedElement.type === 'transition' && renderTransitionProperties(selectedData as Transition)}
          {selectedElement.type === 'arc' && renderArcProperties(selectedData as Arc)}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={saveChanges}
                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Save size={16} />
                <span>Sauvegarder</span>
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                <span>Annuler</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Edit3 size={16} />
                <span>Modifier</span>
              </button>
              <button
                onClick={deleteElement}
                className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                <span>Supprimer</span>
              </button>
            </>
          )}
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils d'utilisation</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {selectedElement.type === 'place' && (
              <>
                <li>• Les jetons représentent les ressources disponibles</li>
                <li>• La capacité limite le nombre maximal de jetons</li>
                <li>• Une capacité vide = capacité illimitée</li>
              </>
            )}
            {selectedElement.type === 'transition' && (
              <>
                <li>• Le délai simule le temps de traitement</li>
                <li>• Une transition est activée si toutes ses places d'entrée ont assez de jetons</li>
                <li>• L'état s'actualise automatiquement</li>
              </>
            )}
            {selectedElement.type === 'arc' && (
              <>
                <li>• Le poids détermine le nombre de jetons consommés/produits</li>
                <li>• Un poids > 1 est affiché sur l'arc</li>
                <li>• Les arcs relient places et transitions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};