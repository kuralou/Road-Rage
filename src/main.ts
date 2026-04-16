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

// --- MOVED UP: TEXTURE LOADER ---
// We need this earlier now so we can load the background images before drawing them
const textureLoader = new THREE.TextureLoader();

// --- NEW: CLOUDS BACKGROUND ---
const cloudTexture = textureLoader.load('assets/backgrounds/clouds.png');
cloudTexture.colorSpace = THREE.SRGBColorSpace; 
cloudTexture.wrapS = THREE.RepeatWrapping;
cloudTexture.wrapT = THREE.RepeatWrapping;
// Tile it more horizontally to prevent stretching
cloudTexture.repeat.set(3, 7); 

const cloudMaterial = new THREE.MeshBasicMaterial({ map: cloudTexture, transparent: true });
// Make the plane much wider and shorter to fix the aspect ratio
const cloudGeometry = new THREE.PlaneGeometry(400, 400); 
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
// Lower it slightly to match the new dimensions
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

// The Road Plane
const roadGeometry = new THREE.PlaneGeometry(10, 200);
const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2; 
scene.add(road);

// --- NEW: GRASS TEXTURE AND 3D HILLS ---
const grassTexture = textureLoader.load('assets/backgrounds/grass_texture.png');
grassTexture.colorSpace = THREE.SRGBColorSpace;
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
// Reduced repeats so the grass image is larger and legible!
grassTexture.repeat.set(2, 10); 

const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });

// Made the grass wider (60 instead of 50) so it can slide UNDER the road
const grassGeometry = new THREE.PlaneGeometry(60, 200, 30, 50); 
const positions = grassGeometry.attributes.position;

// Math to curve the flat plane into GENTLE rolling hills
for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const z = Math.sin(y * 0.2) * 0.8; 
    positions.setZ(i, z);
}

// Left Grass Plane
const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
leftGrass.rotation.x = -Math.PI / 2;
// Shifted closer to the center (-28) and lowered slightly (-0.1) to sit under the asphalt
leftGrass.position.set(-35, -0.9, 0); 
scene.add(leftGrass);

// Right Grass Plane
const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
rightGrass.rotation.x = -Math.PI / 2;
// Shifted closer to the center (28) and lowered slightly (-0.1) to sit under the asphalt
rightGrass.position.set(35, -.9, 0); 
scene.add(rightGrass);


// 3. Load your 2D Art as "Sprites" (Billboarding)
// --- NEW: Updated to player.png and added wrapS for horizontal flipping ---
const playerTexture = textureLoader.load('assets/sprites/player.png');
playerTexture.wrapS = THREE.RepeatWrapping; 

// --- NEW: PRESERVE PIXEL QUALITY ---
// This forces Three.js to keep the sharp pixel edges when we scale the image up
playerTexture.magFilter = THREE.NearestFilter;
playerTexture.minFilter = THREE.NearestFilter;

const playerMaterial = new THREE.SpriteMaterial({ map: playerTexture });
const player = new THREE.Sprite(playerMaterial);

// --- NEW: ENLARGED SCALE AND POSITION ---
player.scale.set(4, 4, 1); 
// Raised the Y position from 1 to 2 so the larger sprite doesn't clip into the road
player.position.set(0, 2, 5); 
scene.add(player);

const carTexture = textureLoader.load('assets/sprites/car.png');
const carMaterial = new THREE.SpriteMaterial({ map: carTexture });
const car = new THREE.Sprite(carMaterial);
car.scale.set(3, 3, 1);
car.position.set(0, 1, 12); 
scene.add(car);

// --- NEW: MOBILE TILT CONTROLS ---
let playerTargetX = 0; // Where the player SHOULD be based on tilt

window.addEventListener('deviceorientation', (e) => {
    if (e.beta !== null) {
        // Map the phone's tilt to a position on the road
        let calculatedX = (e.beta / 30) * 5; 
        
        // ROAD BOUNDARIES: Restrict the player between -4 and 4 so they stay on the road
        playerTargetX = Math.max(-4, Math.min(4, calculatedX)); 
    }
});

// 4. The Game Loop
function animate() {
    requestAnimationFrame(animate);

    // --- NEW: CLOUD EASE ANIMATION ---
    // The Sine wave naturally eases left and right perfectly over time
    cloudTexture.offset.x = Math.sin(Date.now() * 0.0005) * 0.1;

    // ANIMATE THE ROAD
    roadTexture.offset.y += 0.05; 
    
   // --- ANIMATE THE GRASS ---
    // Slowed down to 0.025 to perfectly match the new texture scale
    grassTexture.offset.y += 0.015;

    // --- NEW: ANIMATE THE PLAYER ---
    // 1. Smoothly slide the player towards the target tilt position
    player.position.x += (playerTargetX - player.position.x) * 0.1;

    // 2. Flip horizontally based on which side of the screen they are on
    if (player.position.x > 0) {
        // Right side: Normal facing
        playerTexture.repeat.set(1, 1);
        playerTexture.offset.set(0, 0);
    } else {
        // Left side: Flipped horizontally
        playerTexture.repeat.set(-1, 1);
        playerTexture.offset.set(1, 0); // Offset pushes the image back into the frame after flipping
    }

    // 3. Subtle Walking/Tilting Shake
    const moveSpeed = Math.abs(playerTargetX - player.position.x);
    if (moveSpeed > 0.05) {
        // Player is moving: Add a rocking rotation and a tiny Y-axis bounce
        player.material.rotation = Math.sin(Date.now() * 0.015) * 0.2; 
        // Updated base Y to 2 to match the new larger scale
        player.position.y = 2 + Math.abs(Math.sin(Date.now() * 0.015)) * 0.15;
    } else {
        // Player is still: Reset to default standing pose
        player.material.rotation = 0;
        player.position.y = 2; // Updated base Y to 2
    }

    // Make the car drive
    car.position.z -= 0.3;

    // Reset car
    if (car.position.z < -50) {
        car.position.z = 12; 
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});