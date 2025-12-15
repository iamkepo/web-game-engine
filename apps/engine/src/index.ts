import * as THREE from "three";

export type EngineInit = {
  canvas: HTMLCanvasElement;
};

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  constructor(init: EngineInit) {
    this.renderer = new THREE.WebGLRenderer({ canvas: init.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);
    this.camera.lookAt(0, 0, 0);

    const grid = new THREE.GridHelper(20, 20, 0x666666, 0x444444);
    this.scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 4, 2);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  getThreeScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  render = (): void => {
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }

  private onResize = (): void => {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}
