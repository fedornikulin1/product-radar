'use client';

import { useEffect, useRef } from 'react';

export default function ColorBendsBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = 0;

    function handleMouseMove(event: MouseEvent) {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function animate() {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;

      const root = rootRef.current;

      if (root) {
        root.style.setProperty('--mouse-x', String(currentX));
        root.style.setProperty('--mouse-y', String(currentY));
      }

      frameId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', handleMouseMove);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={rootRef} className="color-bends-background" aria-hidden="true">
      <div className="color-bends-image" />
      <div className="color-bends-overlay" />
      <div className="color-bends-noise" />
    </div>
  );
}