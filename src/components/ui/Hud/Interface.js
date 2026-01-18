"use client";
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { CharacterModel } from '../../shared/CharacterPreview';
import { UnitFrames } from './UnitFrames';
import { Minimap } from './Minimap';
import { ActionBar } from './ActionBar'; // Neu importieren

export function Interface({ 
  playerName, 
  playerHealth, 
  playerPos, 
  remotePlayers, 
  targetData 
}) {
  const [showCharacter, setShowCharacter] = useState(false);

  return (
    <div style={uiContainerStyle}>
      {/* UNIT FRAMES */}
      <UnitFrames 
        playerName={playerName} 
        playerHealth={playerHealth} 
        targetName={targetData?.name} 
        targetHealth={targetData?.health}
      />

      {/* MINIMAP */}
      <Minimap playerPos={playerPos} remotePlayers={remotePlayers} />

      {/* ACTION BAR (Neu & Gekapselt) */}
      <ActionBar slots={24} columns={12} label="PRIMARY_NEURAL_LINK" />

      {/* CHARACTER WINDOW */}
      {showCharacter && (
        <div style={windowStyle}>
          <div style={windowHeader}>
            CHARACTER_STATUS 
            <button onClick={() => setShowCharacter(false)} style={closeBtnStyle}>X</button>
          </div>
          <div style={{ height: '400px', background: '#000' }}>
            <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6}>
                  <CharacterModel />
                </Stage>
              </Suspense>
              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </div>
      )}

      {/* NAV BUTTONS */}
      <div style={navStyle}>
        <button style={btnStyle} onClick={() => setShowCharacter(!showCharacter)}>C - CHARACTER</button>
      </div>
    </div>
  );
}

// Styles (nur die nötigen für den Container)
const uiContainerStyle = { position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'monospace', color: '#ff0' };
const navStyle = { position: 'absolute', bottom: '100px', right: '20px', display: 'flex', flexDirection: 'column', gap: '5px', pointerEvents: 'auto' };
const btnStyle = { background: '#000', color: '#ff0', border: '1px solid #ff0', padding: '5px 10px', cursor: 'pointer' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' };
const windowStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', background: 'rgba(0,0,0,0.95)', border: '2px solid #ff0', pointerEvents: 'auto', zIndex: 1000 };
const windowHeader = { background: '#ff0', color: '#000', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' };