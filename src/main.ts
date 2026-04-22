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
const playerRunTexture = textureLoader.load('assets/sprites/player_run.png?v=2');
playerRunTexture.colorSpace = THREE.SRGBColorSpace;
playerRunTexture.wrapS = THREE.RepeatWrapping;
playerRunTexture.magFilter = THREE.NearestFilter;
playerRunTexture.minFilter = THREE.NearestFilter;

const playerHurtTexture = textureLoader.load('assets/sprites/player_hurt.png?v=2');
playerHurtTexture.colorSpace = THREE.SRGBColorSpace;
playerHurtTexture.wrapS = THREE.RepeatWrapping;
playerHurtTexture.magFilter = THREE.NearestFilter;
playerHurtTexture.minFilter = THREE.NearestFilter;

const playerMaterial = new THREE.SpriteMaterial({ map: playerRunTexture });
const player = new THREE.Sprite(playerMaterial);
player.scale.set(4, 4, 1);
player.position.set(0, 2, 2);
scene.add(player);

// --- LOAD WRONG WAY SIGN ---
const wrongWayTexture = textureLoader.load('assets/sprites/wrong_way.png?v=2');
wrongWayTexture.colorSpace = THREE.SRGBColorSpace;
wrongWayTexture.magFilter = THREE.NearestFilter;
wrongWayTexture.minFilter = THREE.NearestFilter;

const wrongWaySign = new THREE.Sprite(new THREE.SpriteMaterial({ map: wrongWayTexture, transparent: true }));
wrongWaySign.scale.set(8, 8, 1);
wrongWaySign.position.set(20, -0.5, -20);
wrongWaySign.renderOrder = 100;
scene.add(wrongWaySign);

// --- LOAD OBSTACLE CAR SPRITES ---
const leftCar1Texture = textureLoader.load('assets/sprites/left_car1.png?v=2');
leftCar1Texture.colorSpace = THREE.SRGBColorSpace;
leftCar1Texture.magFilter = THREE.NearestFilter;
leftCar1Texture.minFilter = THREE.NearestFilter;

const leftCar2Texture = textureLoader.load('assets/sprites/left_car2.png?v=2');
leftCar2Texture.colorSpace = THREE.SRGBColorSpace;
leftCar2Texture.magFilter = THREE.NearestFilter;
leftCar2Texture.minFilter = THREE.NearestFilter;

const rightCarTexture = textureLoader.load('assets/sprites/right_car1.png?v=2');
rightCarTexture.colorSpace = THREE.SRGBColorSpace;
rightCarTexture.magFilter = THREE.NearestFilter;
rightCarTexture.minFilter = THREE.NearestFilter;

const rightCar2Texture = textureLoader.load('assets/sprites/right_car2.png?v=2');
rightCar2Texture.colorSpace = THREE.SRGBColorSpace;
rightCar2Texture.magFilter = THREE.NearestFilter;
rightCar2Texture.minFilter = THREE.NearestFilter;

// --- GAME STATE & CONTROLS ---
let playerTargetX = 0;
let isGameOver = false;
let lives = 3;
let livesDisplay: HTMLImageElement[] = [];

let activeCars: { sprite: THREE.Sprite, isLeftLane: boolean, fadingOut?: boolean, hasHit?: boolean, speedMultiplier?: number }[] = [];
let lastSpawnTime = 0;
let spawnInterval = 3500;
let gameSpeed = 0.3;
let waveCount = 0;
let isPlayerHurt = false;
let hurtRecoveryTime = 0;

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
    waveCount = 0;
    isPlayerHurt = false;
    hurtRecoveryTime = 0;
    (player.material as THREE.SpriteMaterial).map = playerRunTexture;

    activeCars.forEach(car => scene.remove(car.sprite));
    activeCars = [];
    
    updateLivesDisplay();
});

// --- DEVELOPER TOOL: SPRITE DEBUGGER ---
let devMode = false;
let editMode = false;
let selectedSprite: THREE.Sprite | null = null;
const devSprites: { sprite: THREE.Sprite, name: string }[] = [];

let draggedCorner: string | null = null;
let dragStartX = 0;
let dragStartY = 0;
let spriteStartScale = { x: 0, y: 0 };

const editOverlay = document.createElement('div');
editOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.3); display: none; z-index: 999;
`;
document.body.appendChild(editOverlay);

const editControls = document.createElement('div');
editControls.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9); color: white; padding: 15px 20px;
    border-radius: 8px; z-index: 1001; font-family: monospace;
    border: 2px solid #4CAF50; display: none;
`;
editControls.innerHTML = `
    <p style="margin: 0 0 10px 0; font-size: 12px;">🎮 Sprite Edit Mode</p>
    <p style="margin: 0 0 10px 0; font-size: 12px;">Drag corners to resize • Drag center to move</p>
    <button onclick="window.finishSpriteEdit()" style="padding: 10px 20px; background: #4CAF50; color: black; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">✓ Done & Save</button>
`;
document.body.appendChild(editControls);

const debuggerOverlay = document.createElement('div');
debuggerOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.9); display: none; z-index: 1000;
    overflow-y: auto; padding: 20px;
`;
debuggerOverlay.innerHTML = `
    <div style="color: white; font-family: monospace; font-size: 14px; max-width: 900px; margin: 0 auto;">
        <h2>🎮 SPRITE DEBUGGER (F7 to close)</h2>
        <p>Available sprites from assets/sprites/ui/:</p>
        <div id="spriteList" style="background: #222; padding: 10px; margin: 10px 0; border-radius: 4px; max-height: 150px; overflow-y: auto;">
            <p>Loading sprites...</p>
        </div>
        <p style="margin-top: 20px;">Active Sprites (click to edit visually):</p>
        <div id="activeList" style="background: #222; padding: 10px; margin: 10px 0; border-radius: 4px; max-height: 150px; overflow-y: auto;">
            <p>None</p>
        </div>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">💡 Click a sprite to enter visual edit mode</p>
    </div>
`;
document.body.appendChild(debuggerOverlay);

// Sample sprite names
const availableSprites = ['life.png', 'dead.png', 'wrong_way.png'];

function updateSpriteList() {
    const spriteList = document.getElementById('spriteList');
    spriteList!.innerHTML = availableSprites.map(sprite => 
        `<div style="padding: 5px; cursor: pointer; background: #333; margin: 5px 0; border-radius: 3px;" onclick="window.addSpriteToScene('${sprite}')">${sprite}</div>`
    ).join('');
}

function updateActiveList() {
    const activeList = document.getElementById('activeList');
    if (devSprites.length === 0) {
        activeList!.innerHTML = '<p>None</p>';
    } else {
        activeList!.innerHTML = devSprites.map((s, i) => 
            `<div style="padding: 5px; cursor: pointer; background: #333; margin: 5px 0; border-radius: 3px;" onclick="window.enterSpriteEditMode(${i})">${s.name} (click to edit)</div>`
        ).join('');
    }
}

(window as any).addSpriteToScene = function(spriteName: string) {
    const texture = textureLoader.load(`assets/sprites/ui/${spriteName}`);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(4, 4, 1);
    sprite.position.set(0, 0, 0);
    scene.add(sprite);
    
    devSprites.push({ sprite, name: spriteName });
    updateActiveList();
};

(window as any).enterSpriteEditMode = function(index: number) {
    selectedSprite = devSprites[index].sprite;
    devMode = false;
    editMode = true;
    debuggerOverlay.style.display = 'none';
    editOverlay.style.display = 'block';
    editControls.style.display = 'block';
};

(window as any).finishSpriteEdit = function() {
    if (!selectedSprite) return;
    const spriteName = devSprites.find(s => s.sprite === selectedSprite)?.name || 'unknown.png';
    const cleanName = spriteName.replace('.png', '');
    const code = `const ${cleanName} = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureLoader.load('assets/sprites/ui/${spriteName}'), transparent: true }));
${cleanName}.scale.set(${selectedSprite.scale.x.toFixed(1)}, ${selectedSprite.scale.y.toFixed(1)}, 1);
${cleanName}.position.set(${selectedSprite.position.x.toFixed(2)}, ${selectedSprite.position.y.toFixed(2)}, ${selectedSprite.position.z.toFixed(2)});
scene.add(${cleanName});`;
    navigator.clipboard.writeText(code);
    alert('✓ Sprite code copied to clipboard!\n\nPosition: ' + selectedSprite.position.x.toFixed(2) + ', ' + selectedSprite.position.y.toFixed(2) + ', ' + selectedSprite.position.z.toFixed(2) + '\nScale: ' + selectedSprite.scale.x.toFixed(1) + 'x' + selectedSprite.scale.y.toFixed(1));
    exitSpriteEditMode();
};

function exitSpriteEditMode() {
    editMode = false;
    selectedSprite = null;
    editOverlay.style.display = 'none';
    editControls.style.display = 'none';
    draggedCorner = null;
}

// F7 to toggle debugger
window.addEventListener('keydown', (e) => {
    if (e.key === 'F7') {
        e.preventDefault();
        if (editMode) {
            exitSpriteEditMode();
        } else {
            devMode = !devMode;
            debuggerOverlay.style.display = devMode ? 'block' : 'none';
            if (devMode) {
                updateSpriteList();
                updateActiveList();
            }
        }
    }
});

// Handle sprite dragging and resizing
document.addEventListener('mousedown', (e) => {
    if (!editMode || !selectedSprite) return;
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    spriteStartScale = { x: selectedSprite.scale.x, y: selectedSprite.scale.y };
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('sprite-corner')) {
        draggedCorner = target.dataset.corner || null;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!editMode || !selectedSprite) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    if (draggedCorner) {
        // Resize based on corner
        const scale = 0.02;
        if (draggedCorner === 'br') {
            selectedSprite.scale.x = Math.max(1, spriteStartScale.x + deltaX * scale);
            selectedSprite.scale.y = Math.max(1, spriteStartScale.y + deltaY * scale);
        } else if (draggedCorner === 'bl') {
            selectedSprite.scale.x = Math.max(1, spriteStartScale.x - deltaX * scale);
            selectedSprite.scale.y = Math.max(1, spriteStartScale.y + deltaY * scale);
        } else if (draggedCorner === 'tr') {
            selectedSprite.scale.x = Math.max(1, spriteStartScale.x + deltaX * scale);
            selectedSprite.scale.y = Math.max(1, spriteStartScale.y - deltaY * scale);
        } else if (draggedCorner === 'tl') {
            selectedSprite.scale.x = Math.max(1, spriteStartScale.x - deltaX * scale);
            selectedSprite.scale.y = Math.max(1, spriteStartScale.y - deltaY * scale);
        }
    }
});

document.addEventListener('mouseup', () => {
    draggedCorner = null;
});

// Add indicator text in top right
const devIndicator = document.createElement('div');
devIndicator.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 100;
    background: rgba(0, 0, 0, 0.7); color: #FFF054; padding: 10px 15px;
    border-radius: 4px; font-family: monospace; font-size: 12px; cursor: pointer;
`;
devIndicator.innerHTML = 'Press F7 for Sprite Debugger';
document.body.appendChild(devIndicator);

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
            playerRunTexture.repeat.set(1, 1);
            playerRunTexture.offset.set(0, 0);
        } else {
            playerRunTexture.repeat.set(-1, 1);
            playerRunTexture.offset.set(1, 0);
        }

        const moveSpeed = Math.abs(playerTargetX - player.position.x);
        if (moveSpeed > 0.05) {
            player.material.rotation = Math.sin(Date.now() * 0.015) * 0.2;
            player.position.y = 2 + Math.abs(Math.sin(Date.now() * 0.015)) * 0.15;
        } else {
            player.material.rotation = 0;
            player.position.y = 2;
        }

        // Handle hurt recovery
        if (isPlayerHurt) {
            hurtRecoveryTime--;
            if (hurtRecoveryTime <= 0) {
                isPlayerHurt = false;
                (player.material as THREE.SpriteMaterial).map = playerRunTexture;
            }
        }

        // --- CAR SPAWNING LOGIC ---
        const now = Date.now();
        if (now - lastSpawnTime > spawnInterval) {
            lastSpawnTime = now;
            waveCount++;

            // Faster difficulty scaling to keep game challenging
            const scaleFactor = 1 + (waveCount * 0.015);
            spawnInterval = Math.max(2000, spawnInterval - (10 * scaleFactor));
            gameSpeed = Math.min(1.0, gameSpeed + 0.01 * scaleFactor);

            // Moderate stagger to keep cars reasonably spaced
            const leftZOffset = Math.random() > 0.5 ? -80 : -50;
            const rightZOffset = leftZOffset === -80 ? -50 : -80;

            // Spawn cars on both lanes with staggered Z positions
            for (let lane of [true, false]) {
                const isLeftLane = lane;

                const isRightCar2 = !isLeftLane && Math.random() > 0.7;
                const carTexture = isLeftLane ? (Math.random() > 0.7 ? leftCar1Texture : leftCar2Texture) : (isRightCar2 ? rightCar2Texture : rightCarTexture);
                
                const carSprite = new THREE.Sprite(
                    new THREE.SpriteMaterial({ map: carTexture, transparent: true })
                );

                // Enlarge right_car2 (truck) to match other cars better, and position it towards center
                const scale = isRightCar2 ? 5 : 4;
                carSprite.scale.set(scale, scale, 1);

                const zOffset = isLeftLane ? leftZOffset : rightZOffset;

                if (isLeftLane) {
                    carSprite.position.set(-2.2, 2, zOffset);
                } else {
                    // Move right_car2 slightly right towards center
                    const xPos = isRightCar2 ? 2.6 : 2.2;
                    carSprite.position.set(xPos, 2, zOffset);
                }

                const speedMultiplier = 0.85 + Math.random() * 0.3;
                scene.add(carSprite);
                activeCars.push({ sprite: carSprite, isLeftLane, speedMultiplier });
            }
        }

        // --- CAR MOVEMENT & COLLISION CHECKING ---
        for (let i = activeCars.length - 1; i >= 0; i--) {
            const carData = activeCars[i];

            if (!carData.fadingOut) {
                const speed = (carData.speedMultiplier || 1) * gameSpeed;
                carData.sprite.position.z += 1 * speed;

                const zDist = Math.abs(carData.sprite.position.z - player.position.z);
                const xDist = Math.abs(carData.sprite.position.x - player.position.x);

                if (zDist < 2.0 && xDist < 2.0 && !carData.hasHit) {
                    carData.hasHit = true;
                    lives--;
                    isPlayerHurt = true;
                    hurtRecoveryTime = 60; // Show hurt sprite for 60 frames (~1 second at 60fps)
                    (player.material as THREE.SpriteMaterial).map = playerHurtTexture;
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