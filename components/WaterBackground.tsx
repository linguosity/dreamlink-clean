'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

/**
 * WaterBackground Component
 *
 * A performant 3D water plane background using Three.js and React Three Fiber.
 * Features a calm ocean surface with gentle wave animation. Optimized for
 * low performance impact with minimal geometry and demand-based rendering.
 *
 * Performance optimizations:
 * - Low resolution plane geometry (4x4 segments)
 * - dpr={1} to cap pixel ratio
 * - frameloop="demand" with manual invalidation
 * - No shadows, reflections, or post-processing
 * - Fallback to CSS gradient for SSR and WebGL unavailability
 */

interface WaterPlaneProps {
  invalidate: () => void;
  scrollY: React.RefObject<number>;
}

// Base camera position — scroll moves forward from here
const BASE_CAM_Z = 18;
const BASE_CAM_Y = 8;

// How far the camera travels per pixel of scroll
// 0.008 = subtle drift; increase for more dramatic movement
const SCROLL_SPEED = 0.008;

// Max camera travel distance (prevents drifting too far into fog)
const MAX_TRAVEL = 12;

function WaterPlane({ invalidate, scrollY }: WaterPlaneProps) {
  const { gl, scene, camera } = useThree();
  const waterRef = useRef<Water | null>(null);
  // Smoothed scroll value for buttery lerp
  const smoothScroll = useRef(0);

  useEffect(() => {
    // Create the water geometry with minimal segments for performance
    const geometry = new THREE.PlaneGeometry(200, 200, 16, 16);

    // Water shader material with calm, visible settings
    const water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        '/textures/waternormals.jpg',
        (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        }
      ),
      alphaMap: undefined,
      sunDirection: new THREE.Vector3(0.0, 1.0, 0.0).normalize(),
      sunColor: 0xd4dde3,
      waterColor: 0x8fa5ab,
      distortionScale: 1.2,
      fog: true,
      format: THREE.RGBAFormat,
    });

    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);
    waterRef.current = water;

    // Add lighting so the water surface is visible
    const ambientLight = new THREE.AmbientLight(0xc5d5db, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xe8eef0, 0.6);
    dirLight.position.set(0, 1, 0);
    scene.add(dirLight);

    // Heavy fog — water fades into pale mist like the original photo
    const fogColor = new THREE.Color(0xdfe8ec);
    scene.fog = new THREE.Fog(fogColor, 10, 55);
    scene.background = fogColor;

    // Gentle angle — water in lower half, fog/mist in upper half
    camera.position.set(0, BASE_CAM_Y, BASE_CAM_Z);
    camera.lookAt(0, 0, -20);

    return () => {
      scene.remove(water);
      scene.remove(ambientLight);
      scene.remove(dirLight);
      geometry.dispose();
      water.material.dispose();
    };
  }, [gl, scene, camera]);

  // Animate the water surface and glide camera based on scroll
  useFrame(() => {
    if (waterRef.current) {
      waterRef.current.material.uniforms['time'].value += 0.0081;

      // Smooth lerp toward the target scroll position (0.06 = gentle easing)
      const target = Math.min(scrollY.current * SCROLL_SPEED, MAX_TRAVEL);
      smoothScroll.current += (target - smoothScroll.current) * 0.06;

      // Move camera forward (negative Z) and dip slightly as you scroll
      camera.position.z = BASE_CAM_Z - smoothScroll.current;
      camera.position.y = BASE_CAM_Y - smoothScroll.current * 0.15;
      camera.lookAt(0, 0, camera.position.z - 38);

      invalidate();
    }
  });

  return null;
}

/**
 * Main WaterBackground component
 * Returns a fixed full-screen canvas with water effect
 * Includes fallback for SSR and WebGL unavailability
 */
export function WaterBackground() {
  const [isClient, setIsClient] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    setIsClient(true);

    // Track scroll position in a ref (no re-renders, read each frame)
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      // Trigger a frame so the camera updates
      invalidateRef.current?.();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger the fade-in reveal shortly after client mount so the
  // canvas has a moment to initialise before the animation begins
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => setIsRevealed(true), 120);
      return () => clearTimeout(timer);
    }
  }, [isClient]);

  // Check for WebGL support
  const isWebGLAvailable = () => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !!gl;
    } catch {
      return false;
    }
  };

  // For SSR or WebGL unavailable, show CSS gradient fallback
  if (!isClient || !isWebGLAvailable()) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg,
            #dfe8ec 0%,
            #cdd8de 30%,
            #b5c4cb 60%,
            #9aacb3 100%)`,
          opacity: isRevealed ? 1 : 0,
          transition: 'opacity 1.8s ease-out',
        }}
      />
    );
  }

  return (
    <div
      ref={canvasWrapperRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        filter: 'blur(4px)',
        opacity: isRevealed ? 1 : 0,
        transition: 'opacity 1.8s ease-out',
      }}
    >
      <Canvas
        dpr={1}
        frameloop="demand"
        onCreated={(state) => {
          invalidateRef.current = state.invalidate;
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <WaterPlane invalidate={() => invalidateRef.current?.()} scrollY={scrollYRef} />
      </Canvas>
    </div>
  );
}

export default WaterBackground;
