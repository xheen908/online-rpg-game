import React from 'react';
import { Box } from '@react-three/drei';
import { MAP, GRID_SIZE, ARENA_STRUCTURE } from '../world/mapData';

export function Map0({ wallTexture, bridgeTexture }) {
  return (
    <group name="Map0_Schergrat">
      {/* Wände aus dem Grid */}
      {MAP.map((row, z) => row.map((cell, x) => cell === 1 && (
        <Box key={`wall-${x}-${z}`} position={[x * GRID_SIZE, 5, z * GRID_SIZE]} args={[GRID_SIZE, 10, GRID_SIZE]}>
          <meshStandardMaterial map={wallTexture} />
        </Box>
      )))}

      {/* Massive Säulen */}
      {ARENA_STRUCTURE.pillars.map((p) => (
        <Box key={p.id} position={p.pos} args={p.size}>
          <meshStandardMaterial map={wallTexture} color="#333" />
        </Box>
      ))}

      {/* Brücke */}
      <group position={ARENA_STRUCTURE.bridge.pos}>
        <Box args={ARENA_STRUCTURE.bridge.size}>
          <meshStandardMaterial map={bridgeTexture} />
        </Box>
        <Box position={[0, 0, -ARENA_STRUCTURE.bridge.size[2]/2]} args={[ARENA_STRUCTURE.bridge.size[0], 1.5, 1]}>
          <meshStandardMaterial color="#111" />
        </Box>
        <Box position={[0, 0, ARENA_STRUCTURE.bridge.size[2]/2]} args={[ARENA_STRUCTURE.bridge.size[0], 1.5, 1]}>
          <meshStandardMaterial color="#111" />
        </Box>
      </group>

      {/* Rampen */}
      {ARENA_STRUCTURE.ramps.map((r) => (
        <group key={r.id} position={r.pos} rotation={r.rot}>
          <Box args={r.size}>
            <meshStandardMaterial map={bridgeTexture} />
          </Box>
          <Box position={[r.size[0]/2, 0.2, 0]} args={[0.5, 1.2, r.size[2]]}>
            <meshStandardMaterial color="#000" />
          </Box>
          <Box position={[-r.size[0]/2, 0.2, 0]} args={[0.5, 1.2, r.size[2]]}>
            <meshStandardMaterial color="#000" />
          </Box>
        </group>
      ))}
    </group>
  );
}