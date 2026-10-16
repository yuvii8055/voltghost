import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Equipment } from '../../types';

export type TwinVisualMode = 'REAL' | 'GHOST' | 'GAP' | 'THERMAL' | 'CARBON';

interface Machine3DProps {
  equipment: Equipment;
  mode: TwinVisualMode;
  isSelected: boolean;
  onSelect: (eq: Equipment) => void;
}

export const Machine3D: React.FC<Machine3DProps> = ({
  equipment,
  mode,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const gapKw = Math.max(0, equipment.currentKw - equipment.idealKw);
  const isWasteful = gapKw > 5;

  // Gentle idle animation and cursor tilt
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (equipment.state === 'running') {
        meshRef.current.position.y = (Math.sin(state.clock.elapsedTime * 6) * equipment.vibrationMmS * 0.015);
      }
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.08, 1.08, 1.08), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  // Calculate material color based on Mode
  let mainColor = '#3b82f6';
  let opacity = 1.0;
  let transparent = false;
  let wireframe = false;

  if (mode === 'REAL') {
    mainColor = equipment.state === 'fault' ? '#ef4444' : isSelected ? '#00FFC6' : '#64748b';
  } else if (mode === 'GHOST') {
    mainColor = '#00FFC6';
    opacity = 0.5;
    transparent = true;
    wireframe = true;
  } else if (mode === 'GAP') {
    if (isWasteful) {
      mainColor = '#FF3366';
      opacity = 0.9;
    } else {
      mainColor = '#10B981';
      opacity = 0.4;
      transparent = true;
    }
  } else if (mode === 'THERMAL') {
    // Temp mapping: 20C (blue) -> 100C (red) -> 900C (bright yellow/white)
    const t = Math.min(1, equipment.tempC / 120);
    mainColor = t > 0.7 ? '#ef4444' : t > 0.4 ? '#f59e0b' : '#06b6d4';
  } else if (mode === 'CARBON') {
    const emission = equipment.currentKw * 0.71;
    mainColor = emission > 40 ? '#991b1b' : emission > 15 ? '#f97316' : '#10b981';
  }

  // Machine geometric proportions based on type
  const getGeometry = () => {
    switch (equipment.type) {
      case 'compressor':
        return <cylinderGeometry args={[1.2, 1.2, 2.2, 16]} />;
      case 'chiller':
        return <boxGeometry args={[3.2, 2.0, 2.2]} />;
      case 'furnace':
        return <boxGeometry args={[2.5, 3.2, 2.5]} />;
      case 'cnc':
        return <boxGeometry args={[2.4, 2.2, 2.2]} />;
      case 'solar':
        return <boxGeometry args={[3.8, 0.2, 2.8]} />;
      case 'conveyor':
        return <boxGeometry args={[4.2, 0.8, 1.2]} />;
      case 'robot':
        return <cylinderGeometry args={[0.8, 1.2, 2.6, 12]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <group
      position={equipment.position3D}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(equipment);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={meshRef}>
        {/* Base Machine Mesh */}
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          {getGeometry()}
          <meshStandardMaterial
            color={mainColor}
            transparent={transparent}
            opacity={opacity}
            wireframe={wireframe}
            roughness={0.3}
            metalness={0.7}
            emissive={isWasteful && mode === 'GAP' ? '#FF3366' : isSelected ? '#00FFC6' : '#000000'}
            emissiveIntensity={isWasteful && mode === 'GAP' ? 0.6 : isSelected ? 0.4 : 0.0}
          />
        </mesh>

        {/* Ghost Twin overlay in GAP mode */}
        {mode === 'GAP' && isWasteful && (
          <mesh position={[0, 1, 0]}>
            {getGeometry()}
            <meshStandardMaterial
              color="#00FFC6"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        )}

        {/* Status Indicator Beacon */}
        <mesh position={[0, 2.4, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={
              equipment.state === 'running'
                ? isWasteful
                  ? '#FF3366'
                  : '#10B981'
                : equipment.state === 'idle'
                ? '#F59E0B'
                : '#6B7280'
            }
          />
        </mesh>

        {/* Floating 3D HTML Tooltip on hover or selection */}
        {(hovered || isSelected) && (
          <Html position={[0, 3.2, 0]} center distanceFactor={14}>
            <div className="bg-black/90 backdrop-blur-md border border-[var(--color-accent,#00FFC6)]/60 text-white rounded-xl px-3 py-2 shadow-2xl pointer-events-none min-w-[140px] text-center">
              <div className="text-[11px] font-bold text-[#00FFC6] truncate">
                {equipment.name}
              </div>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs">
                <span className="font-mono font-bold text-white">{equipment.currentKw} kW</span>
                {isWasteful && (
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-1 py-0.2 rounded font-mono font-semibold">
                    +{gapKw.toFixed(1)} kW GAP
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 uppercase mt-0.5">
                {equipment.zone}
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};
