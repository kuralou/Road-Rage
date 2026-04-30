import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


import { initGame } from '../script/main';

@customElement('app-home')
export class AppHome extends LitElement {

  static styles = css`
    :host {
      display: block;
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      background-color: #60BFFF;
    }

    #game-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    /* THE ANIMATED START/LOADING SCREEN */
    #start-screen {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #2A3D3A;
      transition: opacity 0.5s ease-out;
    }

    #bg-layer {
      position: absolute;
      inset: 0;
      background-image: url('assets/ui/loading_background.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 1;
    }

    #grass-layer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100vw;
      height: auto;
      z-index: 2;
      transform: translateY(100%);
      animation: slideUp 0.6s ease-out forwards 0.2s;
    }

    #cars-layer {
      position: absolute;
      bottom: -5%;
      left: 50%;
      width: 90vw;
      max-width: 800px;
      z-index: 3;
      transform: translate(-50%, 100%);
      animation: slideUpCenter 0.6s ease-out forwards 0.8s;
    }

    #logo-layer {
      position: absolute;
      top: 10%;
      left: 50%;
      width: 80vw;
      max-width: 600px;
      z-index: 4;
      opacity: 0;
      transform: translate(-50%, 0) scale(3);
      animation: slapIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.4s;
    }

    #start-btn {
      position: absolute;
      bottom: 15%;
      z-index: 5;
      background-color: #E60000;
      color: white;
      border: 6px solid white;
      border-radius: 12px;
      padding: 15px 40px;
      font-size: 2.5rem;
      font-family: sans-serif;
      font-weight: 900;
      text-transform: uppercase;
      box-shadow: 0px 8px 0px rgba(0,0,0,0.5);
      cursor: pointer;
      opacity: 0;
      transform: scale(0.8);
      animation: popIn 0.3s ease-out forwards 2s;
    }

    #start-btn:disabled {
      background-color: #888;
      cursor: wait;
    }

    /* ANIMATIONS */
    @keyframes slideUp { to { transform: translateY(0); } }
    @keyframes slideUpCenter { to { transform: translate(-50%, 0); } }
    @keyframes slapIn { to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
    @keyframes popIn { to { opacity: 1; transform: scale(1); } }

    #game-container {
      width: 100%;
      height: 100%;
    }

    canvas {
      display: block;
    }
  `;

async firstUpdated() {
    // 1. Grab the div where the game should live
    const container = this.renderRoot.querySelector('#game-container') as HTMLElement;

    if (container) {
      // 2. Call the function from main.ts and pass the container to it
      initGame(container);
    }

    // 3. (Optional) Logic to enable your start button once assets load
    // For now, let's just make the button clickable for testing:
    const startBtn = this.renderRoot.querySelector('#start-btn') as HTMLButtonElement;
    if (startBtn) {
      startBtn.innerText = "START";
      startBtn.disabled = false;
      startBtn.onclick = () => {
        const screen = this.renderRoot.querySelector('#start-screen') as HTMLElement;
        if (screen) screen.style.opacity = '0';
        setTimeout(() => screen?.remove(), 500);
      };
    }
  }

  render() {
    return html`
      <div id="game-wrapper">
        <div id="start-screen">
          <div id="bg-layer"></div>
          <img src="assets/ui/grass_slide_up.png" id="grass-layer" alt="grass" />
          <img src="assets/ui/cars_slide_up.png" id="cars-layer" alt="cars" />
          <img src="assets/ui/roadrage_logo.png" id="logo-layer" alt="logo" />
          <button id="start-btn" disabled>LOADING...</button>
        </div>

        <div id="game-container"></div>
      </div>
    `;
  }
}