import * as THREE from 'three';
import { setupStartScreen } from './startScreen';

export function initGame(container: HTMLElement) { 
    // 1. Setup the Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#60BFFF');

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    
    container.appendChild(renderer.domElement);

    // --- UI SETUP: GAME OVER SCREEN ---
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: none; flex-direction: column;
        justify-content: center; align-items: center; z-index: 10;
    `;
    container.appendChild(uiContainer);

    const loseText = document.createElement('h1');
    loseText.innerText = 'You lost!';
    loseText.style.color = 'white';
    loseText.style.fontFamily = 'sans-serif';
    loseText.style.fontSize = '4rem';
    loseText.style.marginBottom = '2rem';
    uiContainer.appendChild(loseText);

    const retryButton = document.createElement('button');
    retryButton.innerText = 'Play again';
    retryButton.style.cssText = `
        padding: 20px 40px; font-size: 2rem; cursor: pointer; border: none;
        border-radius: 10px; background-color: #FFF054; color: #2A3D3A; font-weight: bold;
    `;
    uiContainer.appendChild(retryButton);

    // --- LIVES HUD SETUP ---
    const livesHUD = document.createElement('div');
    livesHUD.id = 'lives-hud';
    livesHUD.style.cssText = `
        position: absolute; top: 20px; left: 20px; display: flex; gap: 15px; z-index: 5;
    `;
    container.appendChild(livesHUD);

    // --- LOADING MANAGER & TEXTURE LOADER ---
    const loadingManager = new THREE.LoadingManager();
    setupStartScreen(loadingManager);

    const textureLoader = new THREE.TextureLoader(loadingManager);

    // --- CLOUDS BACKGROUND ---
    const cloudTexture = textureLoader.load('assets/backgrounds/clouds.png');
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    cloudTexture.repeat.set(3, 7);

    const cloudMaterial = new THREE.MeshBasicMaterial({ map: cloudTexture, transparent: true });
    const cloudGeometry = new THREE.PlaneGeometry(400, 400);
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.position.set(0, 20, -100);
    scene.add(clouds);

    // --- DYNAMIC ROAD TEXTURE ---
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2A3D3A';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 0, 8, 256);
    ctx.fillRect(236, 0, 8, 256);
    ctx.fillStyle = '#FFF054';
    ctx.fillRect(118, 0, 20, 128);

    const roadTexture = new THREE.CanvasTexture(canvas);
    roadTexture.colorSpace = THREE.SRGBColorSpace;
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 20);
    roadTexture.magFilter = THREE.NearestFilter;
    roadTexture.minFilter = THREE.NearestFilter;

    const roadGeometry = new THREE.PlaneGeometry(16, 200);
    const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // --- GRASS ---
    const grassTexture = textureLoader.load('assets/backgrounds/grass_texture.png');
    grassTexture.colorSpace = THREE.SRGBColorSpace;
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(2, 10);
    const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });

    function makeGrassGeometry(): THREE.PlaneGeometry {
        const geo = new THREE.PlaneGeometry(60, 200, 30, 50);
        const positions = geo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const z = Math.sin(y * 0.2) * 0.8;
            positions.setZ(i, z);
        }
        return geo;
    }

    const leftGrass = new THREE.Mesh(makeGrassGeometry(), grassMaterial);
    leftGrass.rotation.x = -Math.PI / 2;
    leftGrass.position.set(-38, -0.9, 0);
    scene.add(leftGrass); 

    const rightGrass = new THREE.Mesh(makeGrassGeometry(), grassMaterial);
    rightGrass.rotation.x = -Math.PI / 2;
    rightGrass.position.set(38, -0.9, 0);
    scene.add(rightGrass);

    // --- PLAYER & OBSTACLES ---
    const playerRunTexture = textureLoader.load('assets/sprites/player_run.png');
    playerRunTexture.colorSpace = THREE.SRGBColorSpace;
    playerRunTexture.magFilter = THREE.NearestFilter;
    
    const playerHurtTexture = textureLoader.load('assets/sprites/player_hurt.png');
    playerHurtTexture.colorSpace = THREE.SRGBColorSpace;
    playerHurtTexture.magFilter = THREE.NearestFilter;

    const playerMaterial = new THREE.SpriteMaterial({ map: playerRunTexture });
    const player = new THREE.Sprite(playerMaterial);
    player.scale.set(4, 4, 1);
    player.position.set(0, 2, 2);
    scene.add(player);

    // ALL FOUR TEXTURES LOADED HERE
    const leftCar1Texture = textureLoader.load('assets/sprites/left_car1.png');
    const leftCar2Texture = textureLoader.load('assets/sprites/left_car2.png');
    const rightCarTexture = textureLoader.load('assets/sprites/right_car1.png');
    const rightCar2Texture = textureLoader.load('assets/sprites/right_car2.png');

    // --- GAME STATE ---
    let playerTargetX = 0;
    let isGameOver = false;
    let lives = 3;
    let livesDisplay: HTMLImageElement[] = [];
    let activeCars: any[] = [];
    let lastSpawnTime = 0;
    let spawnInterval = 1500;
    let gameSpeed = 0.4; 
    let waveCount = 0;
    let isPlayerHurt = false;
    let hurtRecoveryTime = 0;

    function updateLivesDisplay() {
        livesHUD.innerHTML = '';
        livesDisplay = [];
        for (let i = 0; i < 3; i++) {
            const img = document.createElement('img');
            img.width = 80; img.height = 80;
            img.style.imageRendering = 'pixelated';
            img.src = i < lives ? 'assets/ui/life.png' : 'assets/ui/dead.png';
            livesHUD.appendChild(img);
            livesDisplay.push(img);
        }
    }
    updateLivesDisplay();

    // --- CONTROLS ---
    const keys: Record<string, boolean> = {};
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    retryButton.addEventListener('click', () => {
        isGameOver = false;
        uiContainer.style.display = 'none';
        player.position.x = 0;
        gameSpeed = 0.4;
        spawnInterval = 1500;
        lives = 3;
        activeCars.forEach(car => scene.remove(car.sprite));
        activeCars = [];
        updateLivesDisplay();
    });

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        if (!isGameOver) {
            if (keys['ArrowLeft'] || keys['a']) playerTargetX = Math.max(-6, playerTargetX - 0.15);
            if (keys['ArrowRight'] || keys['d']) playerTargetX = Math.min( 6, playerTargetX + 0.15);

            roadTexture.offset.y += 0.05 * gameSpeed;
            player.position.x += (playerTargetX - player.position.x) * 0.1;

            // --- SMART SPAWNING LOGIC (FIXED YELLOW FLAGS) ---
            const now = Date.now();
            if (now - lastSpawnTime > spawnInterval) {
                lastSpawnTime = now;
                waveCount++;
                
                const isLeftLane = Math.random() > 0.5;
                let carTexture;

                // Use a random choice to use all textures
                if (isLeftLane) {
                    carTexture = Math.random() > 0.5 ? leftCar1Texture : leftCar2Texture;
                } else {
                    carTexture = Math.random() > 0.5 ? rightCarTexture : rightCar2Texture;
                }

                const carSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: carTexture, transparent: true }));
                carSprite.scale.set(4, 4, 1);
                carSprite.position.set(isLeftLane ? -2.2 : 2.2, 2, -100);
                scene.add(carSprite);
                activeCars.push({ sprite: carSprite, speedMultiplier: 1 });
            }

            // Movement & Collision
            for (let i = activeCars.length - 1; i >= 0; i--) {
                const car = activeCars[i];
                car.sprite.position.z += 1 * gameSpeed;
                
                if (Math.abs(car.sprite.position.z - player.position.z) < 2 && Math.abs(car.sprite.position.x - player.position.x) < 2) {
                    if (!isPlayerHurt) {
                        lives--;
                        isPlayerHurt = true;
                        hurtRecoveryTime = 60;
                        updateLivesDisplay();
                        if (lives <= 0) {
                            isGameOver = true;
                            uiContainer.style.display = 'flex';
                        }
                    }
                }

                if (car.sprite.position.z > 10) {
                    scene.remove(car.sprite);
                    activeCars.splice(i, 1);
                }
            }
            
            if (isPlayerHurt) {
                hurtRecoveryTime--;
                if (hurtRecoveryTime <= 0) isPlayerHurt = false;
            }
        }
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}