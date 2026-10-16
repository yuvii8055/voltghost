import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Equipment } from '../../types';
import { Machine3D, TwinVisualMode } from './Machine3D';

interface Facility3DSceneProps {
  equipmentList: Equipment[];
  mode: TwinVisualMode;
  selectedEquipment: Equipment | null;
  onSelectEquipment: (eq: Equipment) => void;
  dayNightFactor?: number; // 0 (night) to 1 (day)
}

// Animated Energy-flow particles traveling along conduits
const EnergyFlowParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 180;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = 0.2 + Math.random() * 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      spd[i] = 0.05 + Math.random() * 0.08;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += speeds[i];
        if (posArray[i * 3] > 12) {
          posArray[i * 3] = -12;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#00FFC6"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const Facility3DScene: React.FC<Facility3DSceneProps> = ({
  equipmentList,
  mode,
  selectedEquipment,
  onSelectEquipment,
  dayNightFactor = 0.75,
}) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing" data-twin-canvas="true">
      <Canvas
        camera={{ position: [0, 24, 28], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={55}
          dampingFactor={0.08}
        />

        {/* Ambient & Directional Lighting linked to Day/Night */}
        <ambientLight intensity={0.3 + dayNightFactor * 0.5} />
        <directionalLight
          position={[15, 30, 20]}
          intensity={0.6 + dayNightFactor * 0.9}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-12, 10, -10]} intensity={0.4} color="#00FFC6" />
        <pointLight position={[12, 10, 10]} intensity={0.4} color="#8B5CF6" />

        {/* High-tech Factory Floor Grid */}
        <Grid
          renderOrder={-1}
          position={[0, -0.01, 0]}
          infiniteGrid
          cellSize={1.5}
          cellThickness={0.8}
          cellColor="#1e293b"
          sectionSize={6}
          sectionThickness={1.4}
          sectionColor="#00FFC6"
          fadeDistance={50}
        />

        {/* Zone Boundaries Outline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[26, 24]} />
          <meshBasicMaterial
            color="#070b14"
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>

        {/* Energy Flow Particles */}
        <EnergyFlowParticles />

        {/* 12 Facility Equipment Units */}
        {equipmentList.map((eq) => (
          <Machine3D
            key={eq.id}
            equipment={eq}
            mode={mode}
            isSelected={selectedEquipment?.id === eq.id}
            onSelect={onSelectEquipment}
          />
        ))}
      </Canvas>
    </div>
  );
};
