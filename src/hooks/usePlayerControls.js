import { useRef, useState, useEffect, useCallback } from 'react';

export const usePlayerControls = (gameState) => {
  const controlsRef = useRef();
  const [isPaused, setIsPaused] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRightMouseDown, setIsRightMouseDown] = useState(false);
  const [isLeftMouseDown, setIsLeftMouseDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape' && gameState === 'PLAYING') {
        setIsPaused(prev => !prev);
        if (controlsRef.current?.isLocked) controlsRef.current.unlock();
      }
      if (e.code === 'Enter' && gameState === 'PLAYING' && !isPaused) {
        setIsChatOpen(true);
        if (controlsRef.current?.isLocked) controlsRef.current.unlock();
      }
    };

    const handleMouseDown = (e) => {
      // PointerLock NUR im Spiel, nicht in Lobby/Login
      if (gameState !== 'PLAYING' || isPaused || isChatOpen) return;

      if (e.button === 0) { // Links
        setIsLeftMouseDown(true);
        controlsRef.current?.lock();
      } else if (e.button === 2) { // Rechts
        setIsRightMouseDown(true);
        controlsRef.current?.lock();
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) setIsLeftMouseDown(false);
      if (e.button === 2) setIsRightMouseDown(false);
    };

    const handleContextMenu = (e) => {
      if (gameState === 'PLAYING') e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameState, isPaused, isChatOpen]);

  useEffect(() => {
    if (!isLeftMouseDown && !isRightMouseDown && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
    }
  }, [isLeftMouseDown, isRightMouseDown]);

  const setupPointerLockOnCanvas = useCallback((gl) => {}, []);

  return {
    controlsRef,
    isPaused,
    setIsPaused,
    isChatOpen,
    setIsChatOpen,
    isRightMouseDown,
    isLeftMouseDown,
    setupPointerLockOnCanvas,
  };
};