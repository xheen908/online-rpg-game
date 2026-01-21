import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { SPELLS } from '../constants/Spells';

export function useSpellSystem(onSpellComplete) {
  const [castingSpell, setCastingSpell] = useState(null);
  const [castProgress, setCastProgress] = useState(0); 
  const castTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentTargetRef = useRef(null);
  const playerPosRef = useRef(null);

  const calculateDamage = (spell) => {
    // 1. Zufälligen Basisschaden zwischen min und max berechnen
    const min = spell.baseDamage.min;
    const max = spell.baseDamage.max;
    const randomBaseDamage = Math.floor(Math.random() * (max - min + 1) + min);

    // 2. Kritischen Treffer prüfen
    const isCrit = Math.random() < spell.critChance;
    
    // 3. Multiplikator anwenden (auf den zufälligen Basiswert)
    const damage = isCrit ? randomBaseDamage * spell.critMultiplier : randomBaseDamage;
    
    return { damage: Math.floor(damage), isCrit };
  };

  const startCast = useCallback((spellId, playerPos, target) => {
    const spell = SPELLS[spellId];
    if (!spell || castingSpell) return;

    if (!target || target.health <= 0) {
      onSpellComplete?.({ text: "Ungültiges Ziel!", color: "#ff4444" });
      return;
    }

    const targetVec = new THREE.Vector3(...target.pos);
    const distance = playerPos.distanceTo(targetVec);

    if (distance > spell.range) {
      onSpellComplete?.({ text: "Ziel zu weit entfernt!", color: "#ff4444" });
      return;
    }

    setCastingSpell(spell);
    setCastProgress(0);
    currentTargetRef.current = target;
    playerPosRef.current = playerPos;
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!startTimeRef.current) return;

      const currentDist = playerPosRef.current.distanceTo(new THREE.Vector3(...currentTargetRef.current.pos));
      if (currentDist > spell.range) {
        cancelCast();
        onSpellComplete?.({ text: "Ziel außer Reichweite!", color: "#ff4444" });
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / spell.castTime;
      
      if (progress < 1) {
        setCastProgress(progress);
        castTimerRef.current = requestAnimationFrame(updateProgress);
      } else {
        setCastProgress(1);
        const result = calculateDamage(spell);
        
        onSpellComplete?.({
          type: 'PROJECTILE_LAUNCH',
          text: `${spell.name} abgefeuert!`,
          color: spell.color,
          isCrit: result.isCrit,
          damage: result.damage,
          targetId: currentTargetRef.current.id,
          startPos: playerPosRef.current.clone().add(new THREE.Vector3(0, 1.5, 0)),
          targetPos: new THREE.Vector3(...currentTargetRef.current.pos).add(new THREE.Vector3(0, 1.5, 0))
        });

        setTimeout(() => {
          setCastingSpell(null);
          setCastProgress(0);
          startTimeRef.current = null;
        }, 50);
      }
    };

    castTimerRef.current = requestAnimationFrame(updateProgress);
  }, [castingSpell, onSpellComplete]);

  const cancelCast = useCallback(() => {
    if (castTimerRef.current) cancelAnimationFrame(castTimerRef.current);
    startTimeRef.current = null;
    currentTargetRef.current = null;
    setCastingSpell(null);
    setCastProgress(0);
  }, []);

  return { castingSpell, castProgress, startCast, cancelCast };
}