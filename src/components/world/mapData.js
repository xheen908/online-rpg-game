export const GRID_SIZE = 5;
export const WORLD_SIZE = 500;

export const MAP = Array(13).fill(0).map(() => Array(13).fill(0));

export const SPAWN_POINTS = [
  { pos: [15, 3, 20], rot: 0 },
  { pos: [45, 3, 20], rot: 0 },
  { pos: [15, 3, 80], rot: Math.PI },
  { pos: [45, 3, 80], rot: Math.PI },
  { pos: [30, 3, 50], rot: Math.PI / 2 },
  { pos: [5, 3, 50], rot: -Math.PI / 2 }
];

export const ARENA_STRUCTURE = {
  pillars: [
    { id: "p1", pos: [30, 4, 30], size: [15, 8, 15] }, 
    { id: "p2", pos: [30, 4, 70], size: [15, 8, 15] }
  ],
  bridge: { pos: [30, 8.0, 50], size: [12, 0.8, 40] },
  ramps: [
    { id: "r1", pos: [30, 4.0, 11.5], size: [12, 0.8, 25], rot: [-0.34, 0, 0] },
    { id: "r2", pos: [30, 4.0, 88.5], size: [12, 0.8, 25], rot: [0.34, 0, 0] }
  ]
};

// Map-spezifische Gegner-Konfiguration
export const MAP_DUMMIES = {
  HUB: [], // Der Hub ist friedlich
  MAP0: [
    { id: 'm0_d1', pos: [30, 9, 30], rotY: 0, name: "Schergrat Wächter A", health: 50000, maxHealth: 50000 },
    { id: 'm0_d2', pos: [30, 9, 70], rotY: Math.PI, name: "Schergrat Wächter B", health: 50000, maxHealth: 50000 }
  ],
  MAP1: [
    { id: 'm1_d1', pos: [20, 0, 40], rotY: 0, name: "Cyber Target Alpha", health: 100000, maxHealth: 100000 },
    { id: 'm1_d2', pos: [40, 0, 50], rotY: Math.PI / 2, name: "Cyber Target Beta", health: 100000, maxHealth: 100000 },
    { id: 'm1_d3', pos: [10, 8.5, 30], rotY: Math.PI, name: "Plattform Drohne", health: 100000, maxHealth: 100000 }
  ]
};