"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

import { useGameSocket, socket } from '../hooks/useGameSocket';
import { Login } from './Login';
import { Lobby } from './Lobby';
import { Chat } from './Chat';
import { Player } from './engine/Player';
import { World } from './World';
import { EscMenu } from './EscMenu';
import { RemotePlayer } from './shared/GameElements';
import { Dummies } from './Dummies';
import { createWallTexture, createFloorTexture, createBridgeTexture } from './TextureLibrary';
import { SPAWN_POINTS, MAP_DUMMIES } from './world/mapData';
import { useTabTargeting } from '../hooks/useTabTargeting';
import { UnitFrames } from './UnitFrames';
import Interface from './Interface';
import { Map0 } from './maps/Map0';
import { Map1 } from './maps/Map1';
import { WorldMap0 } from './maps/WorldMap0'; 
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useSpellSystem } from '../hooks/useSpellSystem';
import { Frostbolt } from './Frostblitz'; 
import { CombatText } from './CombatText';

function GameContent({
  controlsRef, isChatOpen, isPaused, setIsMoving, setIsFiring,
  playerName, mySpawnPoint, textures, otherPlayers,
  onPlayerHealthChange, playerPosition, onPlayerPositionChange,
  setGlobalTargetedId, currentMapId, isRightMouseDown, isLeftMouseDown,
  startCast, cancelCast, castingSpell, currentMapDummies, 
  projectiles, onProjectileHit, combatTexts, onCombatTextComplete,
  onPortalEnter
}) {
  const { camera, scene } = useThree();

  const allSceneObjects = useMemo(() => {
    return scene.children.filter(obj =>
      obj.type === "Mesh" || (obj.type === "Group" && obj.children.length > 0)
    );
  }, [scene.children]);

  const targetedDummyId = useTabTargeting(playerPosition, camera, allSceneObjects, currentMapDummies);

  useEffect(() => {
    setGlobalTargetedId(targetedDummyId);
  }, [targetedDummyId, setGlobalTargetedId]);

  const renderMap = () => {
    switch (currentMapId) {
      case 'HUB': return <WorldMap0 playerPosition={playerPosition} onPortalEnter={onPortalEnter} />;
      case 'MAP1': return <Map1 playerPosition={playerPosition} onPortalEnter={onPortalEnter} />;
      default: return <Map0 wallTexture={textures.wall} bridgeTexture={textures.bridge} playerPosition={playerPosition} onPortalEnter={onPortalEnter} />;
    }
  };

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={1.5} />
      <pointLight position={[30, 20, 50]} intensity={2.0} castShadow />
      <directionalLight position={[-10, 20, -10]} intensity={1.0} />

      <World />
      <Player
        setMovingState={setIsMoving}
        onShoot={setIsFiring}
        isPaused={isPaused || isChatOpen}
        playerName={playerName}
        spawnPoint={mySpawnPoint}
        onPlayerHealthChange={onPlayerHealthChange}
        onPlayerPositionChange={onPlayerPositionChange}
        startCast={startCast}
        cancelCast={cancelCast}
        castingSpell={castingSpell}
        isRightMouseDown={isRightMouseDown}
        isLeftMouseDown={isLeftMouseDown}
      />

      {renderMap()}

      <Dummies dummies={currentMapDummies} targetedDummyId={targetedDummyId} />

      {projectiles.map(p => (
        <Frostbolt key={p.id} id={p.id} startPos={p.startPos} targetPos={p.targetPos} onHit={onProjectileHit} />
      ))}

      {combatTexts.map(ct => (
        <CombatText key={ct.id} position={ct.position} value={ct.value} color={ct.color} isCrit={ct.isCrit} onComplete={() => onCombatTextComplete(ct.id)} />
      ))}

      {otherPlayers && Object.entries(otherPlayers).map(([id, p]) => (
        <RemotePlayer key={id} {...p} />
      ))}

      <PointerLockControls
        ref={controlsRef}
        enabled={(isRightMouseDown || isLeftMouseDown) && !isPaused && !isChatOpen}
        selector={null}
      />
    </Suspense>
  );
}

export default function TexturedArena() {
  const [gameState, setGameState] = useState('START');
  const [activeMap, setActiveMap] = useState('HUB'); 
  const [playerName, setPlayerName] = useState("");
  const [currentLobby, setCurrentLobby] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [allMapsDummies, setAllMapsDummies] = useState(MAP_DUMMIES);
  const [projectiles, setProjectiles] = useState([]);
  const [combatTexts, setCombatTexts] = useState([]);

  const currentMapDummies = useMemo(() => allMapsDummies[activeMap] || [], [allMapsDummies, activeMap]);

  const handleProjectileHit = useCallback((projectileId) => {
    setProjectiles(prev => {
      const proj = prev.find(p => p.id === projectileId);
      if (proj) {
        const targetDummy = currentMapDummies.find(d => d.id === proj.targetId);
        if (targetDummy) {
          const textId = Math.random().toString();
          setCombatTexts(prevTexts => [...prevTexts, { id: textId, position: targetDummy.pos, value: proj.damage, color: "yellow", isCrit: proj.isCrit }]);
          setAllMapsDummies(prev => ({
            ...prev,
            [activeMap]: prev[activeMap].map(d => d.id === proj.targetId ? { ...d, health: Math.max(0, d.health - proj.damage) } : d)
          }));
        }
        setLocalMessages(m => [...m, { text: `${proj.isCrit ? 'KRITISCH! ' : ''}${proj.damage} Schaden!`, color: proj.color, time: Date.now() }].slice(-50));
      }
      return prev.filter(p => p.id !== projectileId);
    });
  }, [currentMapDummies, activeMap]);

  const removeCombatText = useCallback((id) => setCombatTexts(prev => prev.filter(t => t.id !== id)), []);

  const handleSpellComplete = useCallback((result) => {
    if (result.type === 'PROJECTILE_LAUNCH') {
      setProjectiles(prev => [...prev, { id: Math.random().toString(), startPos: result.startPos, targetPos: result.targetPos, targetId: result.targetId, damage: result.damage, color: result.color, isCrit: result.isCrit }]);
    } else if (result.text) {
        setLocalMessages(prev => [...prev, { ...result, time: Date.now() }].slice(-50));
    }
  }, []);

  const { castingSpell, castProgress, startCast, cancelCast } = useSpellSystem(handleSpellComplete);
  
  const { 
    controlsRef, isPaused, setIsPaused, isChatOpen, setIsChatOpen, 
    isRightMouseDown, isLeftMouseDown 
  } = usePlayerControls(gameState);

  const [chatInput, setChatInput] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [playerCurrentHealth, setPlayerCurrentHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerCurrentPosition, setPlayerCurrentPosition] = useState(new THREE.Vector3());
  const [targetedDummyId, setTargetedDummyId] = useState(null);

  const { chatMessages = [], otherPlayers = {}, activeLobbies = [], lobbyPlayers = [] } = useGameSocket(setGameState);
  const allMessages = useMemo(() => [...chatMessages, ...localMessages], [chatMessages, localMessages]);

  const mySpawnPoint = useMemo(() => {
    const index = lobbyPlayers.findIndex(p => p.id === socket.id);
    return SPAWN_POINTS[index % SPAWN_POINTS.length] || SPAWN_POINTS[0];
  }, [lobbyPlayers]);

  const textures = useMemo(() => ({ wall: createWallTexture(), floor: createFloorTexture(), bridge: createBridgeTexture() }), []);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socket.emit('sendChatMessage', { lobbyId: currentLobby, message: chatInput, playerName });
      setChatInput("");
    }
    if (gameState === 'PLAYING') setIsChatOpen(false);
  };

  const handleMapChange = (mapId) => {
    setActiveMap(mapId);
    setTargetedDummyId(null);
    if (currentLobby) socket.emit('changeMap', { lobbyId: currentLobby, mapId });
  };

  const targetedDummy = useMemo(() => currentMapDummies.find(d => d.id === targetedDummyId), [targetedDummyId, currentMapDummies]);

  const handleStartCast = useCallback((spellId) => {
    if (startCast) startCast(spellId, playerCurrentPosition, targetedDummy);
  }, [startCast, playerCurrentPosition, targetedDummy]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {gameState === 'PLAYING' && (
        <>
          <UnitFrames
            playerName={playerName} playerHealth={playerCurrentHealth} playerMaxHealth={playerMaxHealth}
            targetName={targetedDummy?.name} targetHealth={targetedDummy?.health || 0} targetMaxHealth={targetedDummy?.maxHealth || 100000}
          />
          <Interface castingSpell={castingSpell} castProgress={castProgress} />
        </>
      )}

      {gameState === 'START' && <Login playerName={playerName} setPlayerName={setPlayerName} onEnter={() => {
        if (playerName) {
          setGameState('LOBBY_SELECTION');
          socket.emit('requestLobbyList');
        }
      }} />}

      {(gameState === 'LOBBY_SELECTION' || gameState === 'LOBBY_WAITING') && (
        <Lobby
          gameState={gameState} activeLobbies={activeLobbies} socketId={socket.id}
          currentLobby={currentLobby} lobbyPlayers={lobbyPlayers}
          chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput}
          onSendMessage={handleSendMessage}
          selectedMap={activeMap}
          onMapChange={handleMapChange}
          onJoin={(id) => { setCurrentLobby(id); socket.emit('joinLobby', { lobbyId: id, playerName }); setGameState('LOBBY_WAITING'); }}
          onCreate={() => {
            const id = Math.random().toString(36).substring(2, 7).toUpperCase();
            setCurrentLobby(id);
            socket.emit('createLobby', { lobbyId: id, playerName });
            setGameState('LOBBY_WAITING');
          }}
          onLeave={() => { socket.emit('leaveLobby', currentLobby); setGameState('LOBBY_SELECTION'); }}
          onStart={() => socket.emit('startMatch', currentLobby)}
        />
      )}

      {gameState === 'PLAYING' && isPaused && <EscMenu onResume={() => setIsPaused(false)} onLeave={() => { socket.emit('leaveLobby', currentLobby); setGameState('LOBBY_SELECTION'); }} />}

      {gameState === 'PLAYING' && <Chat chatMessages={allMessages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendMessage} isActive={isChatOpen} />}

      <Canvas shadows camera={{ fov: 75 }}>
        <GameContent
          controlsRef={controlsRef} isChatOpen={isChatOpen} isPaused={isPaused}
          setIsMoving={setIsMoving} setIsFiring={setIsFiring} playerName={playerName}
          mySpawnPoint={mySpawnPoint} textures={textures} otherPlayers={otherPlayers}
          onPlayerHealthChange={(c, m) => { setPlayerCurrentHealth(c); setPlayerMaxHealth(m); }}
          playerPosition={playerCurrentPosition}
          onPlayerPositionChange={(pos) => setPlayerCurrentPosition(pos.clone())}
          setGlobalTargetedId={setTargetedDummyId}
          currentMapId={activeMap}
          isRightMouseDown={isRightMouseDown}
          isLeftMouseDown={isLeftMouseDown}
          startCast={handleStartCast}
          cancelCast={cancelCast}
          castingSpell={castingSpell}
          currentMapDummies={currentMapDummies}
          projectiles={projectiles}
          onProjectileHit={handleProjectileHit}
          combatTexts={combatTexts}
          onCombatTextComplete={removeCombatText}
          onPortalEnter={handleMapChange} 
        />
      </Canvas>
    </div>
  );
}