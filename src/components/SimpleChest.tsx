// src/components/SimpleChest.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { PresentationControls, Environment, Float } from '@react-three/drei';
import { Group } from 'three';

function SimpleChest(props: any) {
  const group = useRef<Group>();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1, 0.4, 0.6]} />
        <meshStandardMaterial
          color={hovered ? "#ffd700" : "#cc9900"}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Lid */}
      <mesh 
        position={[0, 0.1, -0.15]} 
        rotation={[hovered ? 0.5 : 0.3, 0, 0]}
      >
        <boxGeometry args={[1, 0.2, 0.6]} />
        <meshStandardMaterial
          color={hovered ? "#ffd700" : "#cc9900"}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Lock */}
      <mesh position={[0, 0, 0.31]}>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#444" 
          metalness={1} 
          roughness={0.2} 
        />
      </mesh>
    </group>
  );
}

function AnimatedSimpleChest() {
  return (
    <div className="h-64 w-64">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #ff1a1a 0%, #990000 100%)'
        }}
      >
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <Float
            speed={1.4}
            rotationIntensity={1.5}
            floatIntensity={2}
          >
            <SimpleChest scale={1.5} />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
}

export default AnimatedSimpleChest;