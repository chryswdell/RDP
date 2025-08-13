import { PetriNet } from '../types/PetriNet';

export const assemblyLineExample: PetriNet = {
  places: [
    {
      id: 'raw-materials',
      name: 'Matières Premières',
      position: { x: 100, y: 200 },
      tokens: 15,
      maxCapacity: 30,
      color: '#dbeafe'
    },
    {
      id: 'station-1-ready',
      name: 'Station 1 Libre',
      position: { x: 300, y: 150 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'station-1-working',
      name: 'Station 1 Occupée',
      position: { x: 300, y: 250 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'intermediate-buffer',
      name: 'Tampon Intermédiaire',
      position: { x: 500, y: 200 },
      tokens: 0,
      maxCapacity: 8,
      color: '#fef3c7'
    },
    {
      id: 'station-2-ready',
      name: 'Station 2 Libre',
      position: { x: 700, y: 150 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'station-2-working',
      name: 'Station 2 Occupée',
      position: { x: 700, y: 250 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'finished-products',
      name: 'Produits Finis',
      position: { x: 900, y: 200 },
      tokens: 0,
      maxCapacity: 100,
      color: '#e0e7ff'
    }
  ],
  transitions: [
    {
      id: 'start-processing-1',
      name: 'Début Usinage 1',
      position: { x: 200, y: 200 },
      enabled: true,
      delay: 800,
      color: '#16a34a'
    },
    {
      id: 'finish-processing-1',
      name: 'Fin Usinage 1',
      position: { x: 400, y: 200 },
      enabled: false,
      delay: 1200,
      color: '#16a34a'
    },
    {
      id: 'start-processing-2',
      name: 'Début Usinage 2',
      position: { x: 600, y: 200 },
      enabled: false,
      delay: 600,
      color: '#16a34a'
    },
    {
      id: 'finish-processing-2',
      name: 'Fin Usinage 2',
      position: { x: 800, y: 200 },
      enabled: false,
      delay: 1000,
      color: '#16a34a'
    }
  ],
  arcs: [
    {
      id: 'arc-1',
      from: 'raw-materials',
      to: 'start-processing-1',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-2',
      from: 'station-1-ready',
      to: 'start-processing-1',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-3',
      from: 'start-processing-1',
      to: 'station-1-working',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-4',
      from: 'station-1-working',
      to: 'finish-processing-1',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-5',
      from: 'finish-processing-1',
      to: 'station-1-ready',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-6',
      from: 'finish-processing-1',
      to: 'intermediate-buffer',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-7',
      from: 'intermediate-buffer',
      to: 'start-processing-2',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-8',
      from: 'station-2-ready',
      to: 'start-processing-2',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-9',
      from: 'start-processing-2',
      to: 'station-2-working',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-10',
      from: 'station-2-working',
      to: 'finish-processing-2',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-11',
      from: 'finish-processing-2',
      to: 'station-2-ready',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-12',
      from: 'finish-processing-2',
      to: 'finished-products',
      weight: 1,
      type: 'transition-to-place'
    }
  ]
};

export const inventoryManagementExample: PetriNet = {
  places: [
    {
      id: 'supplier',
      name: 'Fournisseur',
      position: { x: 100, y: 300 },
      tokens: 50,
      maxCapacity: 100,
      color: '#dbeafe'
    },
    {
      id: 'warehouse',
      name: 'Entrepôt',
      position: { x: 300, y: 300 },
      tokens: 25,
      maxCapacity: 60,
      color: '#dcfce7'
    },
    {
      id: 'production-floor',
      name: 'Atelier Production',
      position: { x: 500, y: 200 },
      tokens: 0,
      maxCapacity: 15,
      color: '#fef3c7'
    },
    {
      id: 'quality-control',
      name: 'Contrôle Qualité',
      position: { x: 500, y: 400 },
      tokens: 0,
      maxCapacity: 8,
      color: '#fce7f3'
    },
    {
      id: 'shipping-ready',
      name: 'Prêt Expédition',
      position: { x: 700, y: 300 },
      tokens: 0,
      maxCapacity: 25,
      color: '#e0e7ff'
    },
    {
      id: 'customer-orders',
      name: 'Commandes Client',
      position: { x: 900, y: 300 },
      tokens: 0,
      color: '#f3e8ff'
    },
    {
      id: 'restock-signal',
      name: 'Signal Réappro',
      position: { x: 200, y: 150 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fef2f2'
    }
  ],
  transitions: [
    {
      id: 'order-materials',
      name: 'Commander Matières',
      position: { x: 200, y: 300 },
      enabled: true,
      delay: 300,
      color: '#16a34a'
    },
    {
      id: 'start-production',
      name: 'Début Production',
      position: { x: 400, y: 250 },
      enabled: false,
      delay: 500,
      color: '#16a34a'
    },
    {
      id: 'quality-check',
      name: 'Contrôle Qualité',
      position: { x: 600, y: 350 },
      enabled: false,
      delay: 400,
      color: '#16a34a'
    },
    {
      id: 'ship-products',
      name: 'Expédier Produits',
      position: { x: 800, y: 300 },
      enabled: false,
      delay: 200,
      color: '#16a34a'
    },
    {
      id: 'restock-trigger',
      name: 'Déclencher Réappro',
      position: { x: 200, y: 200 },
      enabled: false,
      delay: 100,
      color: '#ea580c'
    },
    {
      id: 'reject-products',
      name: 'Rejeter Produits',
      position: { x: 400, y: 450 },
      enabled: false,
      delay: 150,
      color: '#dc2626'
    }
  ],
  arcs: [
    {
      id: 'arc-order-1',
      from: 'supplier',
      to: 'order-materials',
      weight: 8,
      type: 'place-to-transition'
    },
    {
      id: 'arc-order-2',
      from: 'order-materials',
      to: 'warehouse',
      weight: 8,
      type: 'transition-to-place'
    },
    {
      id: 'arc-prod-1',
      from: 'warehouse',
      to: 'start-production',
      weight: 3,
      type: 'place-to-transition'
    },
    {
      id: 'arc-prod-2',
      from: 'start-production',
      to: 'production-floor',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-qc-1',
      from: 'production-floor',
      to: 'quality-check',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-qc-2',
      from: 'quality-check',
      to: 'quality-control',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-ship-1',
      from: 'quality-control',
      to: 'ship-products',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-ship-2',
      from: 'ship-products',
      to: 'shipping-ready',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-ship-3',
      from: 'shipping-ready',
      to: 'customer-orders',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-restock-1',
      from: 'warehouse',
      to: 'restock-trigger',
      weight: 5,
      type: 'place-to-transition'
    },
    {
      id: 'arc-restock-2',
      from: 'restock-trigger',
      to: 'restock-signal',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-reject-1',
      from: 'production-floor',
      to: 'reject-products',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-reject-2',
      from: 'reject-products',
      to: 'warehouse',
      weight: 2,
      type: 'transition-to-place'
    }
  ]
};

export const flexibleManufacturingExample: PetriNet = {
  places: [
    {
      id: 'raw-parts',
      name: 'Pièces Brutes',
      position: { x: 100, y: 250 },
      tokens: 20,
      maxCapacity: 40,
      color: '#dbeafe'
    },
    {
      id: 'machine-a-free',
      name: 'Machine A Libre',
      position: { x: 300, y: 150 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'machine-b-free',
      name: 'Machine B Libre',
      position: { x: 300, y: 350 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'machine-a-busy',
      name: 'Machine A Occupée',
      position: { x: 450, y: 150 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'machine-b-busy',
      name: 'Machine B Occupée',
      position: { x: 450, y: 350 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'assembly-buffer',
      name: 'Tampon Assemblage',
      position: { x: 600, y: 250 },
      tokens: 0,
      maxCapacity: 12,
      color: '#fef3c7'
    },
    {
      id: 'assembly-station',
      name: 'Station Assemblage',
      position: { x: 750, y: 200 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'final-products',
      name: 'Produits Finaux',
      position: { x: 900, y: 250 },
      tokens: 0,
      maxCapacity: 50,
      color: '#e0e7ff'
    }
  ],
  transitions: [
    {
      id: 'process-a',
      name: 'Usiner A',
      position: { x: 200, y: 150 },
      enabled: true,
      delay: 700,
      color: '#16a34a'
    },
    {
      id: 'process-b',
      name: 'Usiner B',
      position: { x: 200, y: 350 },
      enabled: true,
      delay: 900,
      color: '#16a34a'
    },
    {
      id: 'finish-a',
      name: 'Finir A',
      position: { x: 525, y: 150 },
      enabled: false,
      delay: 600,
      color: '#16a34a'
    },
    {
      id: 'finish-b',
      name: 'Finir B',
      position: { x: 525, y: 350 },
      enabled: false,
      delay: 800,
      color: '#16a34a'
    },
    {
      id: 'assemble',
      name: 'Assembler',
      position: { x: 675, y: 250 },
      enabled: false,
      delay: 1000,
      color: '#16a34a'
    },
    {
      id: 'complete-assembly',
      name: 'Finaliser',
      position: { x: 825, y: 250 },
      enabled: false,
      delay: 400,
      color: '#16a34a'
    }
  ],
  arcs: [
    {
      id: 'arc-pa-1',
      from: 'raw-parts',
      to: 'process-a',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-pa-2',
      from: 'machine-a-free',
      to: 'process-a',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-pa-3',
      from: 'process-a',
      to: 'machine-a-busy',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-pb-1',
      from: 'raw-parts',
      to: 'process-b',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-pb-2',
      from: 'machine-b-free',
      to: 'process-b',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-pb-3',
      from: 'process-b',
      to: 'machine-b-busy',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-fa-1',
      from: 'machine-a-busy',
      to: 'finish-a',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-fa-2',
      from: 'finish-a',
      to: 'machine-a-free',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-fa-3',
      from: 'finish-a',
      to: 'assembly-buffer',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-fb-1',
      from: 'machine-b-busy',
      to: 'finish-b',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-fb-2',
      from: 'finish-b',
      to: 'machine-b-free',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-fb-3',
      from: 'finish-b',
      to: 'assembly-buffer',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-as-1',
      from: 'assembly-buffer',
      to: 'assemble',
      weight: 2,
      type: 'place-to-transition'
    },
    {
      id: 'arc-as-2',
      from: 'assembly-station',
      to: 'assemble',
      weight: 1,
      type: 'place-to-transition'
    },
    {
      id: 'arc-as-3',
      from: 'assemble',
      to: 'complete-assembly',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-ca-1',
      from: 'complete-assembly',
      to: 'assembly-station',
      weight: 1,
      type: 'transition-to-place'
    },
    {
      id: 'arc-ca-2',
      from: 'complete-assembly',
      to: 'final-products',
      weight: 1,
      type: 'transition-to-place'
    }
  ]
};

export const productionExamples = {
  'Chaîne de Montage': assemblyLineExample,
  'Gestion de Stock': inventoryManagementExample,
  'Système Flexible': flexibleManufacturingExample
};