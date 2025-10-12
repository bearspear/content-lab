// Three.js Type Definitions - Global declarations
declare const THREE: ThreeStatic;

interface ThreeStatic {
  // Core
  Scene: typeof Scene;
  PerspectiveCamera: typeof PerspectiveCamera;
  WebGLRenderer: typeof WebGLRenderer;

  // Objects
  Mesh: typeof Mesh;
  Group: typeof Group;
  Line: typeof Line;
  Points: typeof Points;

  // Geometry
  BoxGeometry: typeof BoxGeometry;
  SphereGeometry: typeof SphereGeometry;
  PlaneGeometry: typeof PlaneGeometry;
  CylinderGeometry: typeof CylinderGeometry;
  BufferGeometry: typeof BufferGeometry;

  // Materials
  MeshBasicMaterial: typeof MeshBasicMaterial;
  MeshStandardMaterial: typeof MeshStandardMaterial;
  LineBasicMaterial: typeof LineBasicMaterial;

  // Lights
  AmbientLight: typeof AmbientLight;
  DirectionalLight: typeof DirectionalLight;
  PointLight: typeof PointLight;

  // Math
  Vector3: typeof Vector3;
  Color: typeof Color;

  REVISION: string;
}

declare class Scene {
  constructor();
  add(...objects: any[]): void;
  remove(...objects: any[]): void;
}

declare class PerspectiveCamera {
  constructor(fov: number, aspect: number, near: number, far: number);
  position: Vector3;
  lookAt(vector: Vector3): void;
}

declare class WebGLRenderer {
  constructor(parameters?: any);
  domElement: HTMLCanvasElement;
  setSize(width: number, height: number): void;
  render(scene: Scene, camera: PerspectiveCamera): void;
}

declare class Mesh {
  constructor(geometry?: any, material?: any);
  position: Vector3;
  rotation: any;
  scale: Vector3;
}

declare class Group {
  constructor();
  add(...objects: any[]): void;
}

declare class Line {
  constructor(geometry?: any, material?: any);
}

declare class Points {
  constructor(geometry?: any, material?: any);
}

declare class BoxGeometry {
  constructor(width?: number, height?: number, depth?: number);
}

declare class SphereGeometry {
  constructor(radius?: number, widthSegments?: number, heightSegments?: number);
}

declare class PlaneGeometry {
  constructor(width?: number, height?: number);
}

declare class CylinderGeometry {
  constructor(radiusTop?: number, radiusBottom?: number, height?: number);
}

declare class BufferGeometry {
  constructor();
}

declare class MeshBasicMaterial {
  constructor(parameters?: any);
  color: Color;
}

declare class MeshStandardMaterial {
  constructor(parameters?: any);
  color: Color;
}

declare class LineBasicMaterial {
  constructor(parameters?: any);
}

declare class AmbientLight {
  constructor(color?: number | string, intensity?: number);
}

declare class DirectionalLight {
  constructor(color?: number | string, intensity?: number);
  position: Vector3;
}

declare class PointLight {
  constructor(color?: number | string, intensity?: number, distance?: number);
  position: Vector3;
}

declare class Vector3 {
  constructor(x?: number, y?: number, z?: number);
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): Vector3;
}

declare class Color {
  constructor(color?: number | string);
  set(color: number | string): Color;
}
