import * as THREE from 'three';

export function setupStartScreen(loadingManager: THREE.LoadingManager) {
    
    let clickListenerAdded = false;
    
    // --- NEW: THE ERROR TRAP ---
    loadingManager.onError = (url) => {
        console.error(`🚨 MISSING IMAGE DETECTED: Could not find ${url}`);
        const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
        if (startBtn) {
            startBtn.innerText = 'ERROR: CHECK CONSOLE';
            startBtn.style.backgroundColor = 'black';
            startBtn.style.borderColor = 'yellow';
            startBtn.style.color = 'yellow';
        }
    };

    loadingManager.onLoad = () => {
        // When Three.js finishes downloading all the textures:
        const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
        
        if (startBtn) {
            // 1. Enable the button and change text
            startBtn.disabled = false;
            startBtn.innerText = 'PLAY GAME!';

            // 2. Only add click listener once to prevent duplicates
            if (!clickListenerAdded) {
                clickListenerAdded = true;
                startBtn.addEventListener('click', () => {
                    const startScreen = document.getElementById('start-screen');
                    if (startScreen) {
                        // Fade out the entire start screen
                        startScreen.style.opacity = '0';
                        
                        // Remove it from the DOM after the fade finishes
                        setTimeout(() => {
                            startScreen.style.display = 'none';
                        }, 500);
                    }
                });
            }
        }
    };
}