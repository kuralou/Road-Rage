import * as THREE from 'three';

// 1. Setup the Scene, Camera, and Renderer
const scene = new THREE.Scene();

// --- NEW: UPDATED SKY COLOR ---
scene.background = new THREE.Color('#60BFFF'); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container')?.appendChild(renderer.domElement);

// --- UI SETUP: GAME OVER SCREEN ---
// Creates an HTML overlay directly via JavaScript so you don't have to touch your HTML/CSS files
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '0';
uiContainer.style.left = '0';
uiContainer.style.width = '100vw';
uiContainer.style.height = '100vh';
uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
uiContainer.style.display = 'none'; // Hidden by default
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

// --- MOVED UP: TEXTURE LOADER ---
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

// The Road Plane - WIDENED to 16 to comfortably fit the cars
const roadGeometry = new THREE.PlaneGeometry(16, 200);
const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2; 
scene.add(road);

// --- GRASS TEXTURE AND 3D HILLS ---
const grassTexture = textureLoader.load('assets/backgrounds/grass_texture.png');
grassTexture.colorSpace = THREE.SRGBColorSpace;
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(2, 10); 

const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
const grassGeometry = new THREE.PlaneGeometry(60, 200, 30, 50); 
const positions = grassGeometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const z = Math.sin(y * 0.2) * 0.8; 
    positions.setZ(i, z);
}

// Grass planes moved outwards (-38 and 38) to accommodate the wider road
const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
leftGrass.rotation.x = -Math.PI / 2;
leftGrass.position.set(-38, -0.9, 0); 
scene.add(leftGrass);

const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
rightGrass.rotation.x = -Math.PI / 2;
rightGrass.position.set(38, -.9, 0); 
scene.add(rightGrass);

// --- LOAD PLAYER SPRITE ---
const playerTexture = textureLoader.load('assets/sprites/player.png');
playerTexture.colorSpace = THREE.SRGBColorSpace; 
playerTexture.wrapS = THREE.RepeatWrapping; 
playerTexture.magFilter = THREE.NearestFilter;
playerTexture.minFilter = THREE.NearestFilter;

const playerMaterial = new THREE.SpriteMaterial({ map: playerTexture });
const player = new THREE.Sprite(playerMaterial);
player.scale.set(4, 4, 1); 
player.position.set(0, 2, 5); 
scene.add(player);

// --- LOAD OBSTACLE CAR SPRITES ---
const leftCarTexture = textureLoader.load('assets/sprites/left_car1.png');
leftCarTexture.colorSpace = THREE.SRGBColorSpace;
leftCarTexture.magFilter = THREE.NearestFilter;
leftCarTexture.minFilter = THREE.NearestFilter;

const rightCarTexture = textureLoader.load('assets/sprites/right_car1.png');
rightCarTexture.colorSpace = THREE.SRGBColorSpace;
rightCarTexture.magFilter = THREE.NearestFilter;
rightCarTexture.minFilter = THREE.NearestFilter;

// --- GAME STATE & CONTROLS ---
let playerTargetX = 0; 
let isGameOver = false;

// Variables for managing the car spawns
let activeCars: { sprite: THREE.Sprite, isLeftLane: boolean }[] = [];
let lastSpawnTime = 0;
let spawnInterval = 1500; // Time in ms between spawns
let gameSpeed = 1;

window.addEventListener('deviceorientation', (e) => {
    if (e.beta !== null && !isGameOver) {
        let calculatedX = (e.beta / 30) * 6; 
        // Boundary increased to -6 and 6 due to wider road
        playerTargetX = Math.max(-6, Math.min(6, calculatedX)); 
    }
});

// Restart Button Logic
retryButton.addEventListener('click', () => {
    isGameOver = false;
    uiContainer.style.display = 'none'; // Hide UI
    
    // Reset Player
    playerTargetX = 0;
    player.position.x = 0;
    
    // Reset Game Difficulty
    gameSpeed = 1;
    spawnInterval = 1500;
    
    // Clear all cars off the road
    activeCars.forEach(car => scene.remove(car.sprite));
    activeCars = [];
});

// --- THE GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (!isGameOver) {
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
            
            // Gradually pick up the pace over time
            spawnInterval = Math.max(500, spawnInterval - 50); 
            gameSpeed += 0.05;

            // Randomly choose a lane (prevents them from spawning in both lanes at the exact same time)
            const isLeftLane = Math.random() > 0.5;
            const carSprite = new THREE.Sprite(
                new THREE.SpriteMaterial({ map: isLeftLane ? leftCarTexture : rightCarTexture })
            );

            carSprite.scale.set(4, 4, 1);
            
            if (isLeftLane) {
                // Start right behind the player, drive away into the horizon
                carSprite.position.set(-3.5, 2, 12); 
            } else {
                // Start deep in the horizon, drive toward the player
                carSprite.position.set(3.5, 2, -100); 
            }
            
            scene.add(carSprite);
            activeCars.push({ sprite: carSprite, isLeftLane });
        }

        // --- CAR MOVEMENT & COLLISION CHECKING ---
        for (let i = activeCars.length - 1; i >= 0; i--) {
            const carData = activeCars[i];
            
            if (carData.isLeftLane) {
                // Left car moves away from the camera
                carData.sprite.position.z -= 0.4 * gameSpeed; 
            } else {
                // Right car moves towards the camera
                carData.sprite.position.z += 0.4 * gameSpeed; 
            }

            // COLLISION DETECTION
            // Calculate distance between player and this specific car
            const zDist = Math.abs(carData.sprite.position.z - player.position.z);
            const xDist = Math.abs(carData.sprite.position.x - player.position.x);

            // If they overlap on both the X and Z axis, boom!
            if (zDist < 1.5 && xDist < 2.5) { 
                isGameOver = true;
                uiContainer.style.display = 'flex'; // Show Game Over Screen
            }

            // GARBAGE COLLECTION: Remove cars once they are completely off screen
            if (carData.sprite.position.z < -110 || carData.sprite.position.z > 20) {
                scene.remove(carData.sprite);
                activeCars.splice(i, 1);
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