import React, { useMemo } from 'react';
import { Box, Cylinder, Torus } from '@react-three/drei';
import { createPillarTexture, createWallTexture } from '../TextureLibrary';

export function Map1() {
  // Best Practice: Memoization der Texturen zur Performance-Optimierung
  const pillarTex = useMemo(() => createPillarTexture(), []);
  const wallTex = useMemo(() => createWallTexture(), []);

  return (
    <group name="Map1_CyberArena">
      {/* Zentraler Energie-Kern mit Datenpfaden */}
      <Cylinder position={[30, 15, 50]} args={[6, 6, 30, 32]}>
        <meshStandardMaterial 
          map={pillarTex} 
          emissive="#00f2ff" 
          emissiveIntensity={0.8} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </Cylinder>

      {/* Schwebender Ring um das Zentrum */}
      <Torus position={[30, 15, 50]} args={[15, 0.5, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} />
      </Torus>

      {/* Vier taktische Eck-Plattformen */}
      {[
        { pos: [10, 8, 30], color: "#00f2ff" },
        { pos: [50, 8, 30], color: "#00f2ff" },
        { pos: [10, 8, 70], color: "#00f2ff" },
        { pos: [50, 8, 70], color: "#00f2ff" }
      ].map((plat, i) => (
        <group key={i} position={plat.pos}>
          {/* Basis-Plattform */}
          <Box args={[10, 0.8, 10]}>
            <meshStandardMaterial color="#050505" metalness={1} roughness={0.2} />
          </Box>
          {/* Leuchtender Unterbau */}
          <Box args={[10.5, 0.2, 10.5]} position={[0, -0.4, 0]}>
            <meshStandardMaterial emissive={plat.color} emissiveIntensity={1.5} />
          </Box>
          {/* Stütz-Säule nach unten */}
          <Cylinder args={[1, 1, 8]} position={[0, -4.4, 0]}>
            <meshStandardMaterial map={pillarTex} />
          </Cylinder>
        </group>
      ))}

      {/* Äußere Begrenzungswände (Cyber-Optik) */}
      <group name="Boundaries">
        <Box position={[30, 5, -5]} args={[70, 10, 1]}>
          <meshStandardMaterial map={wallTex} />
        </Box>
        <Box position={[30, 5, 105]} args={[70, 10, 1]}>
          <meshStandardMaterial map={wallTex} />
        </Box>
      </group>
    </group>
  );
}