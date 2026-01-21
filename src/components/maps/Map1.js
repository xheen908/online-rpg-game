import React, { useMemo } from 'react';
import { Box, Cylinder, Torus, Sphere, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPillarTexture, createWallTexture } from '../TextureLibrary';

export function Map1({ playerPosition, onPortalEnter }) {
  // Der Ausgang liegt nun am Koordinaten-Ursprung (Eingangsbereich)
  const exitPos = useMemo(() => new THREE.Vector3(0, 2, 0), []);
  
  const pillarTex = useMemo(() => createPillarTexture(), []);
  const wallTex = useMemo(() => createWallTexture(), []);

  useFrame(() => {
    if (playerPosition && playerPosition.distanceTo(exitPos) < 2) {
      onPortalEnter('HUB');
    }
  });

  return (
    <group name="Map1_CyberArena">
      {/* Rückkehr-Portal zum Hub - Direkt am Eingang */}
      <group position={exitPos.toArray()}>
        <Text position={[0, 3, 0]} fontSize={1} color="#00f2ff">EXIT TO HUB</Text>
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} wireframe />
        </Sphere>
      </group>

      {/* Zentraler Energie-Kern (verschoben, damit er nicht im Portal steht) */}
      <group position={[30, 0, 50]}>
        <Cylinder position={[0, 15, 0]} args={[6, 6, 30, 32]}>
          <meshStandardMaterial 
            map={pillarTex} 
            emissive="#00f2ff" 
            emissiveIntensity={0.8} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </Cylinder>

        <Torus position={[0, 15, 0]} args={[15, 0.5, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} />
        </Torus>
      </group>

      {/* Eck-Plattformen */}
      {[
        { pos: [10, 8, 30], color: "#00f2ff" },
        { pos: [50, 8, 30], color: "#00f2ff" },
        { pos: [10, 8, 70], color: "#00f2ff" },
        { pos: [50, 8, 70], color: "#00f2ff" }
      ].map((plat, i) => (
        <group key={i} position={plat.pos}>
          <Box args={[10, 0.8, 10]}>
            <meshStandardMaterial color="#050505" metalness={1} roughness={0.2} />
          </Box>
          <Box args={[10.5, 0.2, 10.5]} position={[0, -0.4, 0]}>
            <meshStandardMaterial emissive={plat.color} emissiveIntensity={1.5} />
          </Box>
          <Cylinder args={[1, 1, 8]} position={[0, -4.4, 0]}>
            <meshStandardMaterial map={pillarTex} />
          </Cylinder>
        </group>
      ))}

      {/* Begrenzungswände */}
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