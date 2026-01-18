"use client";
import React, { useEffect, useRef } from 'react';
import { WORLD_SIZE } from '../../world/mapData';

/**
 * Minimap Komponente
 * Zeichnet eine 2D-Übersicht der Welt auf ein Canvas.
 * @param {Object} playerPos - Aktuelle Position des lokalen Spielers {x, y, z}
 * @param {Object} remotePlayers - Dictionary der anderen Spieler
 * @param {number} size - Pixelgröße der Minimap auf dem Bildschirm
 */
export function Minimap({ playerPos, remotePlayers = {}, size = 150 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Hintergrund zeichnen (leicht transparentes Schwarz)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, size, size);

    // 2. Grid-Linien für Cyber-Look
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.15)';
    ctx.lineWidth = 1;
    const gridStep = size / 5;
    for (let i = 0; i <= size; i += gridStep) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }

    // Skalierungsfaktor berechnen (Welt-Einheiten zu Pixel)
    const scale = size / WORLD_SIZE;

    // 3. Andere Spieler zeichnen (Rote Punkte)
    ctx.fillStyle = '#ff0044';
    Object.values(remotePlayers).forEach(p => {
      if (p.pos) {
        // x und z sind die Boden-Koordinaten in Three.js
        const x = p.pos[0] * scale;
        const z = p.pos[2] * scale;
        
        ctx.beginPath();
        ctx.arc(x, z, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. Lokaler Spieler zeichnen (Leuchtender grüner Punkt)
    if (playerPos) {
      const px = playerPos.x * scale;
      const pz = playerPos.z * scale;

      // Glow Effekt
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff00';
      ctx.fillStyle = '#00ff00';
      
      ctx.beginPath();
      ctx.arc(px, pz, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow zurücksetzen
      ctx.shadowBlur = 0;
    }

    // 5. Rahmen zeichnen
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);

  }, [playerPos, remotePlayers, size]);

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>MAP_RADAR</div>
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        style={{ display: 'block' }}
      />
    </div>
  );
}

// STYLES
const containerStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 110,
  pointerEvents: 'none',
  fontFamily: 'monospace',
};

const labelStyle = {
  background: '#ff0',
  color: '#000',
  fontSize: '10px',
  fontWeight: 'bold',
  padding: '2px 5px',
  textAlign: 'right',
  width: 'fit-content',
  marginLeft: 'auto',
  marginBottom: '2px'
};