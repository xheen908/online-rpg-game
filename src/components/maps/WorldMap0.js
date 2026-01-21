import React from 'react';
import { Box, Sphere, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function WorldMap0({ playerPosition, onPortalEnter }) {
  const portal0Pos = new THREE.Vector3(10, 2, 10);
  const portal1Pos = new THREE.Vector3(-10, 2, 10);

  useFrame(() => {
    if (!playerPosition) return;

    // Check Distanz zu Portal 0 (Map0)
    if (playerPosition.distanceTo(portal0Pos) < 2) {
      onPortalEnter('MAP0');
    }

    // Check Distanz zu Portal 1 (Map1)
    if (playerPosition.distanceTo(portal1Pos) < 2) {
      onPortalEnter('MAP1');
    }
  });

  return (
    <group name="WorldMap0_Hub">
      {/* Einfaches Grid zur Orientierung */}


      {/* Portal zu Map 0 */}
      <group position={portal0Pos.toArray()}>
        <Text position={[0, 3, 0]} fontSize={1} color="#fff">TO STANDARD ARENA</Text>
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial color="#ff0" emissive="#ff0" emissiveIntensity={2} wireframe />
        </Sphere>
      </group>

      {/* Portal zu Map 1 */}
      <group position={portal1Pos.toArray()}>
        <Text position={[0, 3, 0]} fontSize={1} color="#fff">TO CYBER ARENA</Text>
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} wireframe />
        </Sphere>
      </group>

      {/* Dekorative Elemente */}
      <Box position={[0, -0.5, 0]} args={[100, 0.1, 100]}>
        <meshStandardMaterial color="#050505" />
      </Box>
    </group>
  );
}