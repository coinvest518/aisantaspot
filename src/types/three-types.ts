// src/types/three-types.ts
import { Mesh, BufferGeometry, Material, Object3DEventMap, Group } from 'three';

export type GLTFMesh = Mesh<BufferGeometry, Material | Material[]>;

export interface GLTFResult {
  nodes: Record<string, GLTFMesh>;
  materials: Record<string, Material>;
  scene: Group; // Changed from THREE.Group to just Group since we imported it
}