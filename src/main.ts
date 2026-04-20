import * as THREE from 'three';

// 1. Setup the Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#60BFFF');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
document.getElementById('game-container')?.appendChild(renderer.domElement);

// --- UI SETUP: GAME OVER SCREEN ---
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '0';
uiContainer.style.left = '0';
uiContainer.style.width = '100vw';
uiContainer.style.height = '100vh';
uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
uiContainer.style.display = 'none';
uiContainer.style.flexDirection = 'column';
uiContainer.style.justifyContent = 'center';
uiContainer.style.alignItems = 'center';
uiContainer.style.zIndex = '10';
document.body.appendChild(uiContainer);

const loseText = document.createElement('h1');
loseText.innerText = 'You lost!';
loseText.style.color = 'white';
loseText.style.fontFamily = 'sans-serif';
loseText.style.fontSize = '4rem';
loseText.style.marginBottom = '2rem';
uiContainer.appendChild(loseText);

const retryButton = document.createElement('button');
retryButton.innerText = 'Play again';
retryButton.style.padding = '20px 40px';
retryButton.style.fontSize = '2rem';
retryButton.style.cursor = 'pointer';
retryButton.style.border = 'none';
retryButton.style.borderRadius = '10px';
retryButton.style.backgroundColor = '#FFF054';
retryButton.style.color = '#2A3D3A';
retryButton.style.fontWeight = 'bold';
uiContainer.appendChild(retryButton);

// --- LIVES HUD SETUP ---
const livesHUD = document.createElement('div');
livesHUD.id = 'lives-hud';
livesHUD.style.position = 'absolute';
livesHUD.style.top = '20px';
livesHUD.style.left = '20px';
livesHUD.style.display = 'flex';
livesHUD.style.gap = '15px';
livesHUD.style.zIndex = '5';
document.body.appendChild(livesHUD);

// --- TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();

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

// --- DYNAMIC ROAD TEXTURE WITH DOTTED LINES ---
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
roadTexture.generateMipmaps = false;
roadTexture.magFilter = THREE.NearestFilter;
roadTexture.minFilter = THREE.NearestFilter;

const roadGeometry = new THREE.PlaneGeometry(16, 200);
const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// --- GRASS ---
// FIX: Use separate geometry instances so they don't share transforms
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
scene.add(leftGrass); // FIX: was missing entirely

const rightGrass = new THREE.Mesh(makeGrassGeometry(), grassMaterial);
rightGrass.rotation.x = -Math.PI / 2;
rightGrass.position.set(38, -0.9, 0);
scene.add(rightGrass);

// --- LOAD PLAYER SPRITE ---
const playerTexture = textureLoader.load('assets/sprites/player.png?v=2');
playerTexture.colorSpace = THREE.SRGBColorSpace;
playerTexture.wrapS = THREE.RepeatWrapping;
playerTexture.magFilter = THREE.NearestFilter;
playerTexture.minFilter = THREE.NearestFilter;

const playerMaterial = new THREE.SpriteMaterial({ map: playerTexture });
const player = new THREE.Sprite(playerMaterial);
player.scale.set(4, 4, 1);
player.position.set(0, 2, 2);
scene.add(player);

// --- LOAD OBSTACLE CAR SPRITES ---
const leftCarTexture = textureLoader.load('assets/sprites/left_car1.png?v=2');
leftCarTexture.colorSpace = THREE.SRGBColorSpace;
leftCarTexture.magFilter = THREE.NearestFilter;
leftCarTexture.minFilter = THREE.NearestFilter;

const rightCarTexture = textureLoader.load('assets/sprites/right_car1.png?v=2');
rightCarTexture.colorSpace = THREE.SRGBColorSpace;
rightCarTexture.magFilter = THREE.NearestFilter;
rightCarTexture.minFilter = THREE.NearestFilter;

// --- GAME STATE & CONTROLS ---
let playerTargetX = 0;
let isGameOver = false;
let lives = 3;
let livesDisplay: HTMLImageElement[] = [];

let activeCars: { sprite: THREE.Sprite, isLeftLane: boolean, fadingOut?: boolean, hasHit?: boolean }[] = [];
let lastSpawnTime = 0;
let spawnInterval = 3500;
let gameSpeed = 0.3;

// --- INITIALIZE LIVES DISPLAY ---
function updateLivesDisplay() {
    livesHUD.innerHTML = '';
    livesDisplay = [];
    for (let i = 0; i < 3; i++) {
        const img = document.createElement('img');
        img.width = 80;
        img.height = 80;
        img.style.imageRendering = 'pixelated';
        if (i < lives) {
            img.src = 'assets/ui/life.png';
        } else {
            img.src = 'assets/ui/dead.png';
        }
        livesHUD.appendChild(img);
        livesDisplay.push(img);
    }
}

updateLivesDisplay();

// FIX: Keyboard controls — works on desktop and as a fallback everywhere
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup',   (e) => { keys[e.key] = false; });

// FIX: Touch / swipe controls for mobile without motion sensor
let touchStartX = 0;
window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });
window.addEventListener('touchmove', (e) => {
    if (isGameOver) return;
    const dx = e.touches[0].clientX - touchStartX;
    playerTargetX = Math.max(-6, Math.min(6, (dx / window.innerWidth) * 24));
}, { passive: true });
window.addEventListener('touchend', () => {
    // Smoothly return to centre when finger lifts
    playerTargetX = 0;
});

// FIX: Device orientation — request permission on iOS 13+
function enableDeviceOrientation() {
    const handler = (e: DeviceOrientationEvent) => {
        if (e.beta !== null && !isGameOver) {
            const calculatedX = (e.beta / 30) * 6;
            playerTargetX = Math.max(-6, Math.min(6, calculatedX));
        }
    };

    // @ts-ignore — requestPermission exists on iOS but not in the standard TS types
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires a user gesture to grant permission
        const permButton = document.createElement('button');
        permButton.innerText = '🎮 Tap to enable tilt controls';
        permButton.style.cssText = `
            position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
            padding: 12px 24px; font-size: 1rem; z-index: 20;
            background: #FFF054; border: none; border-radius: 8px;
            font-weight: bold; cursor: pointer;
        `;
        document.body.appendChild(permButton);
        permButton.addEventListener('click', async () => {
            // @ts-ignore
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('deviceorientation', handler);
            }
            permButton.remove();
        });
    } else {
        // Android and desktop — no permission needed
        window.addEventListener('deviceorientation', handler);
    }
}
enableDeviceOrientation();

retryButton.addEventListener('click', () => {
    isGameOver = false;
    uiContainer.style.display = 'none';

    playerTargetX = 0;
    player.position.x = 0;

    gameSpeed = 0.3;
    spawnInterval = 3500;
    lives = 3;

    activeCars.forEach(car => scene.remove(car.sprite));
    activeCars = [];
    
    updateLivesDisplay();
});

// --- THE GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (!isGameOver) {
        // FIX: Apply keyboard input each frame
        if (keys['ArrowLeft']  || keys['a'] || keys['A']) playerTargetX = Math.max(-6, playerTargetX - 0.15);
        if (keys['ArrowRight'] || keys['d'] || keys['D']) playerTargetX = Math.min( 6, playerTargetX + 0.15);

        // CLOUD EASE ANIMATION
        cloudTexture.offset.x = Math.sin(Date.now() * 0.0005) * 0.1;

        // ANIMATE SCROLLING ENVIRONMENT
        roadTexture.offset.y += 0.05 * gameSpeed;
        grassTexture.offset.y += 0.015 * gameSpeed;

        // ANIMATE THE PLAYER
        player.position.x += (playerTargetX - player.position.x) * 0.1;

        if (player.position.x > 0) {
            playerTexture.repeat.set(1, 1);
            playerTexture.offset.set(0, 0);
        } else {
            playerTexture.repeat.set(-1, 1);
            playerTexture.offset.set(1, 0);
        }

        const moveSpeed = Math.abs(playerTargetX - player.position.x);
        if (moveSpeed > 0.05) {
            player.material.rotation = Math.sin(Date.now() * 0.015) * 0.2;
            player.position.y = 2 + Math.abs(Math.sin(Date.now() * 0.015)) * 0.15;
        } else {
            player.material.rotation = 0;
            player.position.y = 2;
        }

        // --- CAR SPAWNING LOGIC ---
        const now = Date.now();
        if (now - lastSpawnTime > spawnInterval) {
            lastSpawnTime = now;

            spawnInterval = Math.max(1200, spawnInterval - 10);
            gameSpeed += 0.004;

            const isLeftLane = Math.random() > 0.5;

            const carSprite = new THREE.Sprite(
                new THREE.SpriteMaterial({ map: isLeftLane ? leftCarTexture : rightCarTexture, transparent: true })
            );

            carSprite.scale.set(4, 4, 1);

            if (isLeftLane) {
                carSprite.position.set(-2.2, 2, 6);
            } else {
                carSprite.position.set(2.2, 2, -80);
            }

            scene.add(carSprite);
            activeCars.push({ sprite: carSprite, isLeftLane });
        }

        // --- CAR MOVEMENT & COLLISION CHECKING ---
        for (let i = activeCars.length - 1; i >= 0; i--) {
            const carData = activeCars[i];

            if (!carData.fadingOut) {
                if (carData.isLeftLane) {
                    carData.sprite.position.z -= 0.25 * gameSpeed;
                } else {
                    carData.sprite.position.z += 0.25 * gameSpeed;
                }

                const zDist = Math.abs(carData.sprite.position.z - player.position.z);
                const xDist = Math.abs(carData.sprite.position.x - player.position.x);

                if (zDist < 2.0 && xDist < 2.0 && !carData.hasHit) {
                    carData.hasHit = true;
                    lives--;
                    if (livesDisplay[lives]) {
                        livesDisplay[lives].src = 'assets/ui/dead.png';
                    }
                    
                    if (lives <= 0) {
                        isGameOver = true;
                        uiContainer.style.display = 'flex';
                    }
                }

                // Start fade out when car reaches edge
                if (carData.sprite.position.z < -100 || carData.sprite.position.z > 10) {
                    carData.fadingOut = true;
                }
            }

            // Handle fade out animation
            if (carData.fadingOut) {
                const mat = carData.sprite.material as THREE.SpriteMaterial;
                mat.opacity -= 0.05;
                if (mat.opacity <= 0) {
                    scene.remove(carData.sprite);
                    activeCars.splice(i, 1);
                }
            }
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