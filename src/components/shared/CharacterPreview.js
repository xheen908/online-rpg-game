"use client";
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import * as THREE from 'three';

export function CharacterModel() {
  const fbx = useFBX('/models/rp_nathan_animated_003_walking.fbx');
  const mixer = useRef();

  useEffect(() => {
    if (fbx.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(fbx);
      const action = mixer.current.clipAction(fbx.animations[0]);
      action.play();
    }
  }, [fbx]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive object={fbx} scale={0.02} position={[0, -2.5, 0]} />;
}