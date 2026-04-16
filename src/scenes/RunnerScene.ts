import Phaser from 'phaser';

export class RunnerScene extends Phaser.Scene {
    private sky!: Phaser.GameObjects.TileSprite;
    private graphics!: Phaser.GameObjects.Graphics;
    private speed: number = 0;

    constructor() {
        super('RunnerScene');
    }

    preload() {
        // We can keep the sky image! It sits beautifully in the background.
        this.load.image('sky-pattern', 'assets/backgrounds/sky.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const horizonY = height / 2; // The vanishing point line

        // 1. The Sky (Top Half)
        this.sky = this.add.tileSprite(width / 2, horizonY / 2, width, horizonY, 'sky-pattern');

        // 2. The Graphics object (This draws the 3D road and grass)
        this.graphics = this.add.graphics();
    }

    update(time: number, delta: number) {
        // This variable increases over time to simulate moving forward
        this.speed += delta * 0.003; 

        const width = this.scale.width;
        const height = this.scale.height;
        const horizonY = height / 2; // Middle of the screen

        // Clear the previous frame's drawings
        this.graphics.clear();

        // --- 1. DRAW THE GRASS (Bottom Half) ---
        this.graphics.fillStyle(0x2d8a4e, 1); // A nice grassy green color
        this.graphics.fillRect(0, horizonY, width, height / 2);

        // --- 2. DRAW THE BASE ROAD (Trapezoid) ---
        this.graphics.fillStyle(0x333333, 1); // Dark asphalt gray
        this.graphics.beginPath();
        // Top edge of the road (narrow at the vanishing point)
        this.graphics.moveTo(width / 2 - 40, horizonY); 
        this.graphics.lineTo(width / 2 + 40, horizonY); 
        // Bottom edge of the road (wide at the bottom of the phone screen)
        this.graphics.lineTo(width, height);            
        this.graphics.lineTo(0, height);                
        this.graphics.closePath();
        this.graphics.fillPath();

        // --- 3. ANIMATE THE ROAD LINES (The Illusion of Speed) ---
        this.graphics.fillStyle(0xffffff, 1); // White paint

        // We draw 10 moving segments
        for (let i = 0; i < 10; i++) {
            // Calculate how far down the road this segment is (from 0.0 to 1.0)
            let segment = (i + (this.speed % 1)) / 10; 
            
            // This exponent makes the lines speed up and get thicker as they get closer!
            let zCurve = Math.pow(segment, 3); 

            let lineY = horizonY + (zCurve * (height / 2));
            let lineWidth = 80 + (zCurve * width); // Gets wider at the bottom
            let lineHeight = 1 + (zCurve * 20);    // Gets taller at the bottom

            // Don't draw the lines if they are too close to the vanishing point (looks messy)
            if (segment > 0.1 && segment < 0.95) {
                // Draw dashed lines down the center
                this.graphics.fillRect(width / 2 - (lineWidth * 0.02), lineY, lineWidth * 0.04, lineHeight);
            }
        }
    }
}