import * as THREE from 'three';

export class RunnerScene {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private clock: THREE.Clock;
    private roadMarkings: THREE.Mesh[] = [];
    private animationId: number = 0;

    private readonly ROAD_LENGTH = 200;
    private readonly MARKING_SPACING = 10;
    private readonly MOVE_SPEED = 20;

    constructor(private container: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        // Camera sits at eye-height, looking straight down the road
        this.camera = new THREE.PerspectiveCamera(
            70,
            container.clientWidth / container.clientHeight,
            0.1,
            500
        );
        this.camera.position.set(0, 1.8, 0);
        this.camera.lookAt(0, 1.8, -100);

        this.create();
        this.bindResize();
        this.animate();
    }

    private create() {
        // --- SKY ---
        this.scene.background = new THREE.Color(0x87ceeb);

        // Fog fades geometry into the sky at the horizon
        this.scene.fog = new THREE.Fog(0x87ceeb, 40, 150);

        // --- GRASS ---
        const grassGeo = new THREE.PlaneGeometry(300, this.ROAD_LENGTH);
        const grassMat = new THREE.MeshBasicMaterial({ color: 0x2d8a4e });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.position.set(0, 0, -(this.ROAD_LENGTH / 2));
        this.scene.add(grass);

        // --- ROAD ---
        const roadGeo = new THREE.PlaneGeometry(7, this.ROAD_LENGTH);
        const roadMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0.01, -(this.ROAD_LENGTH / 2)); // sits just above grass
        this.scene.add(road);

        // --- ROAD MARKINGS ---
        // Spawn markings spaced along the full road length
        const markingCount = this.ROAD_LENGTH / this.MARKING_SPACING;
        for (let i = 0; i < markingCount; i++) {
            const markGeo = new THREE.PlaneGeometry(0.25, 2.5);
            const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const mark = new THREE.Mesh(markGeo, markMat);
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(0, 0.02, -(i * this.MARKING_SPACING));
            this.scene.add(mark);
            this.roadMarkings.push(mark);
        }
    }

    private animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    private update(delta: number) {
        const move = this.MOVE_SPEED * delta;

        for (const mark of this.roadMarkings) {
            // Move each marking toward the camera (positive Z = toward viewer)
            mark.position.z += move;

            // Once it passes the camera, loop it back to the far end
            if (mark.position.z > 2) {
                mark.position.z -= this.ROAD_LENGTH;
            }
        }
    }

    private bindResize() {
        window.addEventListener('resize', () => {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    // Call this when tearing down the scene (e.g. navigating away)
    public destroy() {
        cancelAnimationFrame(this.animationId);
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}