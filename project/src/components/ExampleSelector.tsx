import React from 'react';
import { Factory, Package, Cog, BookOpen } from 'lucide-react';
import { productionExamples } from '../data/productionExamples';
import { PetriNet } from '../types/PetriNet';

interface ExampleSelectorProps {
  onExampleSelect: (net: PetriNet) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ onExampleSelect }) => {
  const examples = [
    {
      name: 'Chaîne de Montage',
      description: 'Modélise une chaîne de production séquentielle avec deux stations de travail et un tampon intermédiaire pour optimiser le flux.',
      icon: Factory,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      features: ['2 stations de travail', 'Tampon intermédiaire', 'Gestion des ressources']
    },
    {
      name: 'Gestion de Stock',
      description: 'Système complet avec approvisionnement automatique, production, contrôle qualité et expédition avec gestion des alertes.',
      icon: Package,
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      features: ['Approvisionnement auto', 'Contrôle qualité', 'Alertes de stock']
    },
    {
      name: 'Système Flexible',
      description: 'Système de fabrication flexible avec machines parallèles et assemblage final, permettant une production optimisée.',
      icon: Cog,
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600',
      features: ['Machines parallèles', 'Assemblage flexible', 'Optimisation des flux']
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <BookOpen className="text-blue-500" size={24} />
        <span>Exemples de Systèmes</span>
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Chargez un exemple prédéfini pour explorer différents types de systèmes de production
      </p>
      
      <div className="space-y-4">
        {examples.map((example) => {
          const IconComponent = example.icon;
          return (
            <button
              key={example.name}
              onClick={() => onExampleSelect(productionExamples[example.name])}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${example.color}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <IconComponent size={32} className={`${example.iconColor} mt-1`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-lg ${example.textColor} mb-2`}>
                    {example.name}
                  </h4>
                  <p className={`text-sm ${example.textColor} opacity-80 mb-3 leading-relaxed`}>
                    {example.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {example.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${example.textColor} bg-white bg-opacity-60 font-medium`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
          <span>🎯</span>
          <span>Objectifs d'Analyse</span>
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Vivacité:</strong> Vérifier l'absence de blocages permanents</li>
          <li>• <strong>Bornitude:</strong> S'assurer que les ressources restent finies</li>
          <li>• <strong>Performance:</strong> Analyser l'efficacité et les goulots</li>
          <li>• <strong>Conflits:</strong> Identifier les points de contention</li>
        </ul>
      </div>
    </div>
  );
};