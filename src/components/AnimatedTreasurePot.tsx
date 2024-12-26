// src/components/AnimatedTreasurePot.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useGLTF, PresentationControls, Environment, Float } from '@react-three/drei';
import { Group, Mesh, BufferGeometry, Material } from 'three';

interface GLTFMesh extends Mesh {
  geometry: BufferGeometry;
  material: Material | Material[];
}

interface GLTFResult {
  nodes: Record<string, GLTFMesh>;
  materials: Record<string, Material>;
  scene: Group;
}

function TreasurePot(props: any) {
  const group = useRef<Group>();
  const gltf = useGLTF('/models/treasure_chest.glb') as unknown as GLTFResult;
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  // Simple chest component as fallback
  const SimpleChest = () => (
    <mesh scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        metalness={0.8}
        roughness={0.2}
        color={hovered ? "#ffd700" : "#cc9900"}
      />
    </mesh>
  );

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {gltf.nodes && gltf.nodes.chest ? (
        <primitive 
          object={gltf.scene} 
          scale={hovered ? 1.1 : 1}
        />
      ) : (
        <SimpleChest />
      )}
    </group>
  );
}

function AnimatedTreasurePot() {
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
            <TreasurePot scale={1.5} />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
}

// Make sure to preload the model
useGLTF.preload('/models/treasure_chest.glb');

export default AnimatedTreasurePot;