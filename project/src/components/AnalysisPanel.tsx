import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Activity, TrendingUp, Zap, BarChart3, Clock, Target } from 'lucide-react';
import { Analysis, ProductionMetrics } from '../types/PetriNet';

interface AnalysisPanelProps {
  analysis: Analysis;
  metrics: ProductionMetrics;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, metrics }) => {
  const getStatusIcon = (status: boolean, inverted = false) => {
    const isGood = inverted ? !status : status;
    return isGood ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <XCircle className="text-red-500" size={20} />
    );
  };

  const formatUtilization = (utilization: number) => {
    return `${(utilization * 100).toFixed(1)}%`;
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
        <BarChart3 className="text-blue-500" size={24} />
        <span>Analyse du Système</span>
      </h3>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-800">Production</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{metrics.totalProduced}</div>
          <div className="text-xs text-blue-700">Unités produites</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-800">Efficacité</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{metrics.efficiency.toFixed(1)}%</div>
          <div className="text-xs text-green-700">Utilisation moyenne</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-purple-800">Cycle</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{formatTime(metrics.cycleTime)}</div>
          <div className="text-xs text-purple-700">Temps moyen</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="text-orange-600" size={20} />
            <span className="text-sm font-medium text-orange-800">Attente</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{formatTime(metrics.averageWaitTime)}</div>
          <div className="text-xs text-orange-700">Temps d'attente</div>
        </div>
      </div>

      {/* Network Properties */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
          <Activity className="text-gray-500" size={18} />
          <span>Propriétés du Réseau</span>
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(analysis.isLive)}
              <div>
                <span className="text-sm font-medium">Vivacité (Liveness)</span>
                <p className="text-xs text-gray-600">Toutes les transitions peuvent potentiellement s'exécuter</p>
              </div>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              analysis.isLive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {analysis.isLive ? 'Vivant' : 'Non vivant'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(analysis.isBounded)}
              <div>
                <span className="text-sm font-medium">Bornitude (Boundedness)</span>
                <p className="text-xs text-gray-600">Le nombre de jetons reste fini dans toutes les places</p>
              </div>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              analysis.isBounded 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {analysis.isBounded ? 'Borné' : 'Non borné'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getStatusIcon(analysis.hasDeadlock, true)}
              <div>
                <span className="text-sm font-medium">État de Blocage</span>
                <p className="text-xs text-gray-600">Aucune transition n'est actuellement activée</p>
              </div>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              !analysis.hasDeadlock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {analysis.hasDeadlock ? 'Bloqué' : 'Actif'}
            </span>
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      {Object.keys(metrics.resourceUtilization).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <Zap className="text-purple-500" size={18} />
            <span>Utilisation des Ressources</span>
          </h4>
          <div className="space-y-3">
            {Object.entries(metrics.resourceUtilization).map(([resourceId, utilization]) => (
              <div key={resourceId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{resourceId}</span>
                  <span className={`font-bold ${
                    utilization > 0.8 ? 'text-red-600' :
                    utilization > 0.6 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formatUtilization(utilization)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      utilization > 0.8 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                      utilization > 0.6 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                      'bg-gradient-to-r from-green-400 to-green-600'
                    }`}
                    style={{ width: `${Math.min(utilization * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {analysis.conflicts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <AlertTriangle className="text-yellow-500" size={18} />
            <span>Conflits Détectés</span>
          </h4>
          <div className="space-y-2">
            {analysis.conflicts.map((conflict, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                  <p className="text-sm text-yellow-800 font-medium">{conflict}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottlenecks */}
      {metrics.bottlenecks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={18} />
            <span>Goulots d'Étranglement</span>
          </h4>
          <div className="space-y-2">
            {metrics.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Ressource: {bottleneck}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Cette ressource limite la productivité du système
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Throughput Analysis */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
          <TrendingUp className="text-blue-500" size={18} />
          <span>Débit des Transitions</span>
        </h4>
        <div className="space-y-2">
          {Object.entries(analysis.throughput).map(([transitionId, throughput]) => (
            <div key={transitionId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-700 font-medium">{transitionId}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      throughput > 0.7 ? 'bg-green-500' :
                      throughput > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${throughput * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${
                  throughput > 0.7 ? 'text-green-600' :
                  throughput > 0.3 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(throughput * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
          <Activity className="text-blue-600" size={18} />
          <span>💡 Recommandations</span>
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {metrics.efficiency < 70 && (
            <li>• Optimiser l'utilisation des ressources pour améliorer l'efficacité</li>
          )}
          {metrics.bottlenecks.length > 0 && (
            <li>• Résoudre les goulots d'étranglement identifiés</li>
          )}
          {analysis.conflicts.length > 0 && (
            <li>• Gérer les conflits pour éviter les blocages</li>
          )}
          {!analysis.isLive && (
            <li>• Vérifier la vivacité du réseau pour assurer la continuité</li>
          )}
          {metrics.averageWaitTime > 1000 && (
            <li>• Réduire les temps d'attente en optimisant les tampons</li>
          )}
        </ul>
      </div>
    </div>
  );
};