"use client";
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function CombatText({ position, value, color = "yellow", isCrit = false, onComplete }) {
  const textRef = useRef();
  const [opacity, setOpacity] = useState(1);
  
  // Start-Offset nach oben
  const [posY, setPosY] = useState(position[1] + 3.5); 

  // Einheitliche Größe für alle Zahlen (wie vorher nur bei Crit)
  const scale = 1.2;

  // Shake-Vektor für Crits
  const shakeVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (opacity <= 0) {
      onComplete();
      return;
    }
    
    // Schwebe nach oben
    setPosY(prev => prev + delta * 1.5);
    // Ausfaden
    setOpacity(prev => Math.max(0, prev - delta * 0.8));
    
    if (textRef.current) {
      // Shake-Effekt berechnen, wenn es ein Crit ist
      if (isCrit) {
        const shakeIntensity = 0.15 * opacity; // Intensität nimmt mit Opacity ab
        shakeVec.set(
          (Math.random() - 0.5) * shakeIntensity,
          (Math.random() - 0.5) * shakeIntensity,
          (Math.random() - 0.5) * shakeIntensity
        );
      }

      // Position setzen (Basis-Position + Floating + Shake)
      textRef.current.position.set(
        position[0] + shakeVec.x,
        posY + shakeVec.y,
        position[2] + shakeVec.z
      );

      textRef.current.material.opacity = opacity;
      // Billboard-Effekt
      textRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <Text
      ref={textRef}
      fontSize={scale}
      color={isCrit ? "#ffcc00" : color} 
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.08}
      outlineColor="#000000"
      transparent
      fontWeight="bold" // Jetzt immer Bold
    >
      {value}{isCrit ? "!" : ""}
    </Text>
  );
}