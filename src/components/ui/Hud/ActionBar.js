"use client";
import React from 'react';

const SLOT_SIZE = 44;

export function ActionBar({ slots = 24, columns = 12, label = "MAIN_STATION" }) {
  // Erzeugt ein Array für die Slots
  const slotArray = Array.from({ length: slots });

  return (
    <div style={wrapperStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={gridStyle(columns)}>
        {slotArray.map((_, i) => (
          <div 
            key={i} 
            style={slotStyle}
            onMouseEnter={(e) => e.target.style.borderColor = '#ff0'}
            onMouseLeave={(e) => e.target.style.borderColor = '#444'}
          >
            <span style={keyBindStyle}>{i + 1}</span>
            {/* Hier käme später das Icon rein: <img src={skillIcon} /> */}
          </div>
        ))}
      </div>
    </div>
  );
}

const wrapperStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'auto',
  background: 'rgba(0,0,0,0.9)',
  padding: '12px 8px 8px 8px',
  border: '2px solid #333',
  borderRadius: '4px',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)'
};

const labelStyle = {
  position: 'absolute',
  top: '-10px',
  left: '10px',
  background: '#333',
  color: '#aaa',
  fontSize: '9px',
  padding: '2px 6px',
  letterSpacing: '1px',
  border: '1px solid #444'
};

const gridStyle = (cols) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, ${SLOT_SIZE}px)`,
  gap: '4px'
});

const slotStyle = {
  width: `${SLOT_SIZE}px`,
  height: `${SLOT_SIZE}px`,
  background: 'linear-gradient(135deg, #111 0%, #222 100%)',
  border: '1px solid #444',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.1s'
};

const keyBindStyle = {
  position: 'absolute',
  top: '2px',
  left: '3px',
  fontSize: '9px',
  color: '#666',
  fontWeight: 'bold'
};