import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { socket } from '../../hooks/useGameSocket'; 
import { MAP, GRID_SIZE } from '../world/mapData'; 
import { PlayerModel } from '../shared/PlayerModel';

const PLAYER_SETTINGS = {
  maxHealth: 100,
  speed: 0.2,
  gravity: 0.5,
  jumpStrength: 0.25,
  playerRadius: 1.0
};

export function Player({ 
  setMovingState, onShoot, isPaused, playerName, spawnPoint, 
  onPlayerHealthChange, onPlayerPositionChange,
  startCast, cancelCast, castingSpell, isRightMouseDown, isLeftMouseDown 
}) {
  const { camera, scene } = useThree();
  const moveState = useRef({ 
    forward: false, backward: false, left: false, right: false, 
    jump: false, rotateLeft: false, rotateRight: false
  });
  
  const playerPos = useRef(new THREE.Vector3(...(spawnPoint?.pos || [15, 3, 50])));
  const [currentRotY, setCurrentRotY] = useState(spawnPoint?.rot || 0);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const lastUpdate = useRef(0);
  const [moving, setMoving] = useState(false);
  const [groundedState, setGroundedState] = useState(true);
  const onGround = useRef(true);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const zoomDistance = useRef(5);

  const [playerHealth, setPlayerHealth] = useState(PLAYER_SETTINGS.maxHealth);

  useEffect(() => {
    if (onPlayerHealthChange) onPlayerHealthChange(playerHealth, PLAYER_SETTINGS.maxHealth);
  }, [playerHealth, onPlayerHealthChange]);

  useEffect(() => {
    camera.rotation.order = 'YXZ'; 
    camera.rotation.y = spawnPoint?.rot || 0;
  }, [camera, spawnPoint]);

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      zoomDistance.current = Math.max(2, Math.min(zoomDistance.current + e.deltaY * 0.01, 15));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
  
  useFrame((state, delta) => {
    if (isPaused) return;

    const anyMouseDown = isRightMouseDown || isLeftMouseDown;

    // Charakter folgt Kamera nur bei Rechtsklick
    if (isRightMouseDown) {
      if (Math.abs(currentRotY - camera.rotation.y) > 0.001) {
        setCurrentRotY(camera.rotation.y);
      }
    }
    
    // Tastatur-Rotation NUR wenn keine Maus gehalten wird
    if (!anyMouseDown) {
      if (moveState.current.rotateLeft) camera.rotation.y += 2.0 * delta;
      if (moveState.current.rotateRight) camera.rotation.y -= 2.0 * delta;
      if (Math.abs(currentRotY - camera.rotation.y) > 0.001) setCurrentRotY(camera.rotation.y);
    }
    
    // Strafe Logik: Wenn Maus gehalten, werden A/D zu Seitwärtsschritten
    const isStrafeLeft = anyMouseDown && moveState.current.rotateLeft;
    const isStrafeRight = anyMouseDown && moveState.current.rotateRight;

    const isMovingNow = moveState.current.forward || moveState.current.backward || 
                        moveState.current.left || moveState.current.right ||
                        isStrafeLeft || isStrafeRight;
    
    if (isMovingNow && castingSpell) cancelCast();

    if (isMovingNow !== moving) {
      setMoving(isMovingNow);
      setMovingState(isMovingNow);
    }
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    forward.y = 0; right.y = 0; forward.normalize(); right.normalize();
    
    const moveDir = { forward: false, backward: false, left: false, right: false };
    const velocityVec = new THREE.Vector3(0, 0, 0);

    // Vorwärts / Rückwärts
    if (moveState.current.forward) { velocityVec.add(forward); moveDir.forward = true; }
    if (moveState.current.backward) { velocityVec.sub(forward); moveDir.backward = true; }
    
    // Seitwärts (Q/E immer, A/D nur wenn Maus gehalten)
    if (moveState.current.left || isStrafeLeft) { velocityVec.sub(right); moveDir.left = true; }
    if (moveState.current.right || isStrafeRight) { velocityVec.add(right); moveDir.right = true; }
    
    if (velocityVec.length() > 0) {
      velocityVec.normalize().multiplyScalar(PLAYER_SETTINGS.speed);
      
      const checkCollision = (dir) => {
        const nextPos = playerPos.current.clone().add(dir);
        if (MAP[Math.floor(nextPos.z / GRID_SIZE + 0.5)]?.[Math.floor(nextPos.x / GRID_SIZE + 0.5)] === 1) return true;
        raycaster.ray.origin.copy(playerPos.current).add(new THREE.Vector3(0, 1, 0));
        raycaster.ray.direction.copy(dir).normalize();
        raycaster.far = PLAYER_SETTINGS.playerRadius;
        const hits = raycaster.intersectObjects(scene.children, true);
        return hits.some(h => !h.object.userData.noCollision && !h.object.parent?.userData.noCollision);
      };

      if (!checkCollision(new THREE.Vector3(velocityVec.x, 0, 0))) playerPos.current.x += velocityVec.x;
      if (!checkCollision(new THREE.Vector3(0, 0, velocityVec.z))) playerPos.current.z += velocityVec.z;
    }
    
    if (moveState.current.jump && onGround.current) {
        velocity.current.y = PLAYER_SETTINGS.jumpStrength;
        onGround.current = false;
        setGroundedState(false);
        if (castingSpell) cancelCast();
    }
    velocity.current.y -= PLAYER_SETTINGS.gravity * delta;
    playerPos.current.y += velocity.current.y;
    
    raycaster.ray.origin.copy(playerPos.current).add(new THREE.Vector3(0, 2, 0));
    raycaster.ray.direction.set(0, -1, 0);
    raycaster.far = 10;
    const groundHits = raycaster.intersectObjects(scene.children, true).filter(h => !h.object.userData.noCollision && !h.object.parent?.userData.noCollision);
    
    if (groundHits.length > 0) {
      const gHeight = groundHits[0].point.y + 3;
      if (velocity.current.y <= 0 && playerPos.current.y <= gHeight) {
          playerPos.current.y = gHeight;
          velocity.current.y = 0;
          if (!onGround.current) {
              onGround.current = true;
              setGroundedState(true);
          }
      }
    }

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const desiredPos = playerPos.current.clone().add(camDir.normalize().multiplyScalar(-zoomDistance.current));
    desiredPos.y += 2;
    camera.position.copy(desiredPos);
    
    if (onPlayerPositionChange) onPlayerPositionChange(playerPos.current);
    
    if (Date.now() - lastUpdate.current > 33) {
      socket.emit('playerMovement', { 
        pos: [playerPos.current.x, playerPos.current.y, playerPos.current.z], 
        rot: [0, camera.rotation.y, 0], 
        isMoving: isMovingNow,
        moveDirection: moveDir,
        isGrounded: onGround.current,
        name: playerName
      });
      lastUpdate.current = Date.now();
    }
  });
  
  useEffect(() => {
    const down = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyQ: 'left', KeyE: 'right', KeyA: 'rotateLeft', KeyD: 'rotateRight', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = true;
      if (e.code === 'Digit1' && !isPaused && startCast) startCast('FROSTBOLT');
    };
    const up = (e) => {
      const k = { KeyW: 'forward', KeyS: 'backward', KeyQ: 'left', KeyE: 'right', KeyA: 'rotateLeft', KeyD: 'rotateRight', Space: 'jump' };
      if (k[e.code]) moveState.current[k[e.code]] = false;
    };
    const mDown = (e) => {
      if (e.button === 0 && !isPaused && !isLeftMouseDown && !isRightMouseDown) { 
        onShoot(true); setTimeout(() => onShoot(false), 100); 
      }
    };
    const contextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', down); 
    window.addEventListener('keyup', up);
    window.addEventListener('mousedown', mDown);
    window.addEventListener('contextmenu', contextMenu);
    return () => { 
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); 
      window.removeEventListener('mousedown', mDown);
      window.removeEventListener('contextmenu', contextMenu);
    };
  }, [onShoot, isPaused, startCast, isLeftMouseDown, isRightMouseDown]); 
  
  return (
    <PlayerModel 
      pos={[playerPos.current.x, playerPos.current.y, playerPos.current.z]} 
      rot={[0, currentRotY + Math.PI, 0]} 
      isLocal={true} 
      isMoving={moving} 
      isGrounded={groundedState}
      moveDirection={moving ? moveState.current : null}
      name={playerName}
    />
  );
}