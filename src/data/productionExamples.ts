export const assemblyLineExample: PetriNet = {
  places: [
    {
      id: 'raw-materials',
      name: 'Matières Premières',
      position: { x: 150, y: 250 },
      tokens: 15,
      maxCapacity: 30,
      color: '#dbeafe'
    },
    {
      id: 'station-1-ready',
      name: 'Station 1 Libre',
      position: { x: 350, y: 180 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'station-1-working',
      name: 'Station 1 Occupée',
      position: { x: 350, y: 320 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'intermediate-buffer',
      name: 'Tampon Intermédiaire',
      position: { x: 550, y: 250 },
      tokens: 0,
      maxCapacity: 8,
      color: '#fef3c7'
    },
    {
      id: 'station-2-ready',
      name: 'Station 2 Libre',
      position: { x: 750, y: 180 },
      tokens: 1,
      maxCapacity: 1,
      color: '#dcfce7'
    },
    {
      id: 'station-2-working',
      name: 'Station 2 Occupée',
      position: { x: 750, y: 320 },
      tokens: 0,
      maxCapacity: 1,
      color: '#fed7d7'
    },
    {
      id: 'finished-products',
      name: 'Produits Finis',
      position: { x: 950, y: 250 },
      tokens: 0,
      maxCapacity: 100,
      color: '#e0e7ff'
    }
  ],
  transitions: [
    {
      id: 'start-processing-1',
      name: 'Début Usinage 1',
      position: { x: 250, y: 250 },
      enabled: true,
      delay: 800,
      color: '#16a34a'
    },
    {
      id: 'finish-processing-1',
      name: 'Fin Usinage 1',
      position: { x: 450, y: 250 },
      enabled: false,
      delay: 1200,
      color: '#16a34a'
    },
    {
      id: 'start-processing-2',
      name: 'Début Usinage 2',
      position: { x: 650, y: 250 },
      enabled: false,
      delay: 600,
      color: '#16a34a'
    },
    {
      id: 'finish-processing-2',
      name: 'Fin Usinage 2',
      position: { x: 850, y: 250 },
      enabled: false,
      delay: 1000,
      color: '#16a34a'
    }
  ],
  arcs: []
};