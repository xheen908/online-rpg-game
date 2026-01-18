export const GRID_SIZE = 5;
export const WORLD_SIZE = 500;

// Die MAP wird nur noch für logische Zwecke behalten, nicht gerendert.
export const MAP = Array(13).fill(0).map(() => Array(13).fill(0));

export const SPAWN_POINTS = [
  { pos: [15, 3, 20], rot: 0 },         // Startpunkt 1 (Vorne Links)
  { pos: [45, 3, 20], rot: 0 },         // Startpunkt 2 (Vorne Rechts)
  { pos: [15, 3, 80], rot: Math.PI },    // Startpunkt 3 (Hinten Links)
  { pos: [45, 3, 80], rot: Math.PI },    // Startpunkt 4 (Hinten Rechts)
  { pos: [30, 3, 50], rot: Math.PI / 2 },// Startpunkt 5 (Mitte)
  { pos: [5, 3, 50], rot: -Math.PI / 2 } // Startpunkt 6 (Seite)
];

export const ARENA_STRUCTURE = {
  // Zwei massive Steinsäulen
  pillars: [
    { id: "p1", pos: [30, 4, 30], size: [15, 8, 15] }, 
    { id: "p2", pos: [30, 4, 70], size: [15, 8, 15] }
  ],
  // Die verbindende Holzbrücke oben (leicht über den Säulen: 8.0)
  bridge: { pos: [30, 8.0, 50], size: [12, 0.8, 40] },
  // Die Rampen: 
  ramps: [
    { id: "r1", pos: [30, 4.0, 11.5], size: [12, 0.8, 25], rot: [-0.34, 0, 0] },
    { id: "r2", pos: [30, 4.0, 88.5], size: [12, 0.8, 25], rot: [0.34, 0, 0] }
  ]
};

export const INITIAL_ENEMIES = [
  { id: 1, pos: [30, 9, 30], alive: true },
  { id: 2, pos: [30, 9, 70], alive: true }
];