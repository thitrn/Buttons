/**
 * This file uses the following open-source libraries in addition to our own implementation of our buttons, design, and functionality:
 * 
 * 1. interact.js - JavaScript drag and drop, resizing, and multi-touch gestures library
 *    Website: https://interactjs.io/
 *    Copyright (c) 2012-present Taye Adeyemi
 *    Licensed under MIT License
 *    Used for: Drag, resize, and rotate functionality for stickers
 * 
 * 2. jl-coloringbook - Web component for creating customizable coloring books
 *    Repository: https://github.com/collinph/jl-coloringbook
 *    Copyright (c) 2020-2022 Joe Love
 *    Licensed for free use (as per repository terms)
 *    Used as: Base implementation and inspiration for the coloring book web component
 */

"use strict";
customElements.define('coloring-book', class extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.dragging = false;
        this.paths = [];
        this.color = null;

        this.paletteColors = [
            'rgba(87, 87, 87,0.8)',
            'rgba(220, 35, 35,0.8)',
            'rgba(42, 75, 215,0.8)',
            'rgba(29, 105, 20,0.8)',
            'rgba(129, 74, 25,0.8)',
            'rgba(129, 38, 192,0.8)',
            'rgba(129, 197, 122,0.8)',
            'rgba(157, 175, 255,0.8)',
            'rgba(41, 208, 208,0.8)',
            'rgba(255, 146, 51,0.8)',
            'rgba(255, 238, 51,0.8)',
            'white'
        ];

        this.themePalettes = {
            default: this.paletteColors,
            blossom: [
                'rgba(87, 87, 87, 0.8)',
                'rgba(255, 105, 180, 0.8)',
                'rgba(255, 192, 203, 0.8)',
                'rgba(255, 20, 147, 0.8)',
                'rgba(255, 182, 193, 0.8)',
                'rgba(255, 160, 122, 0.8)',
                'rgba(255, 105, 97, 0.8)',
                'rgba(255, 228, 225, 0.8)',
                'rgba(255, 218, 185, 0.8)',
                'rgba(255, 192, 181, 0.8)',
                'rgba(255, 160, 160, 0.8)',
                'rgba(255, 200, 200, 0.8)',
                'rgba(255, 228, 196, 0.8)',
                'rgba(255, 182, 193, 0.8)',
                'white'
            ],
            bubble: [
                'rgba(87, 87, 87, 0.8)',
                'rgba(135, 206, 250, 0.8)',
                'rgba(173, 216, 230, 0.8)',
                'rgba(70, 130, 180, 0.8)',
                'rgba(176, 224, 230, 0.8)',
                'rgba(95, 158, 160, 0.8)',
                'rgba(175, 238, 238, 0.8)',
                'rgba(135, 206, 235, 0.8)',
                'rgba(176, 196, 222, 0.8)',
                'rgba(230, 230, 250, 0.8)',
                'rgba(200, 220, 255, 0.8)',
                'rgba(180, 200, 255, 0.8)',
                'rgba(220, 230, 255, 0.8)',
                'rgba(190, 210, 255, 0.8)',
                'white'
            ],
            sunflower: [
                'rgba(0, 0, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 165, 0, 0.8)',
                'rgba(255, 140, 0, 0.8)',
                'rgba(255, 255, 0, 0.8)',
                'rgba(218, 165, 32, 0.8)',
                'rgba(255, 223, 0, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(255, 235, 59, 0.8)',
                'rgba(255, 248, 220, 0.8)',
                'rgba(255, 250, 205, 0.8)',
                'rgba(255, 239, 213, 0.8)',
                'rgba(255, 228, 181, 0.8)',
                'rgba(255, 218, 185, 0.8)',
                'rgba(34, 139, 34, 0.8)',
                'rgba(50, 205, 50, 0.8)',
                'rgba(144, 238, 144, 0.8)',
                'rgba(107, 142, 35, 0.8)',
                'rgba(127, 255, 0, 0.8)',
                'rgba(154, 205, 50, 0.8)',
                'white'
            ]
        };

        this.themeTitles = {
            blossom: '<h1>Hi, my name is <br><span>Thi.</span></h1>',
            bubble: '<h1>Hi, my name is <br><span>Delaram.</span></h1>',
            sunflower: '<h1>Hi, my name is <br><span>Abi.</span></h1>'
        };

        this.stickerConfigs = {
            sunflower: ['/assets/stickers/abi/ethiopia.png', '/assets/stickers/abi/music.png', '/assets/stickers/abi/plant.png', '/assets/stickers/abi/poetry.png', '/assets/stickers/abi/tv.png', '/assets/stickers/abi/books.png'],
            bubble: ['/assets/stickers/delaram/iran-flag.png', '/assets/stickers/delaram/cheeseburger.png', '/assets/stickers/delaram/margarita.png', '/assets/stickers/delaram/piano.png', '/assets/stickers/delaram/swan.png', '/assets/stickers/delaram/bubblebath.png'],
            blossom: ['/assets/stickers/crystal/airplane.png', '/assets/stickers/crystal/candy.png', '/assets/stickers/crystal/concert.png', '/assets/stickers/crystal/megaphone.png', '/assets/stickers/crystal/sub.png', '/assets/stickers/crystal/vietnam.png'],
        };
    }

    connectedCallback() {
        this.style.display = 'block';

        const auto = this.getAttribute('autoinit');
        if (auto !== '0') {
            this.init();
        }
    }

    init() {
        this.slotsContainer = document.createElement('div');
        this.slotsContainer.classList.add('slots');
        this.slotsContainer.style.display = 'none';
        const slot = document.createElement('slot');
        this.slotsContainer.appendChild(slot);
        this.shadowRoot.appendChild(this.slotsContainer);

        slot.addEventListener('slotchange', this.drawTemplate.bind(this));
    }

    drawTemplate() {
        console.log('coloring drawTemplate() called.');

        this.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        const style = document.createElement('style');
        style.textContent = `
            .wrapper { width:100%; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}

            .imageNav img {
                box-sizing:border-box;
                border:3px solid transparent;
                width:12%; min-width:75px; max-width:150px;
                margin:4px;
                cursor: pointer;
            }
            .imageNav img.selected {
                border: 3px solid var(--theme-color, #72ac9a);

            }
            .toolbar {
                z-index:100000;
                position: sticky;  position: -webkit-sticky;
                top: 0;
                background-color: rgba(200,200,200,.1)
            }
            .tools {
                display:flex;
                justify-content:flex-end;
                flex-wrap:wrap;
                max-width:100%;
            }
            .sizerTool {
                cursor:inherit;
                align-self:flex-start;
                width:64px;
            }
            .spacer {
                flex-basis:0;
                flex-grow:1;
            }
            .tools > * {margin:2px}
            .palette {
                display:inline-block;
            }
            .paletteColor {
                text-align:center;
                height:28px;
                width:28px;
                margin:2px;
                border-radius:50%;
                box-sizing:border-box;
                border:3px solid rgba(232,232,232,1);
                display:inline-block;
                overflow:hidden;
                cursor: pointer;
            }
            .paletteColor.selected {
                border-color:black;
                transform: scale(1.2);
            }

            .paletteColor.eraser { border-color: red; background-image: linear-gradient(135deg,white 43%, red 45%, red 55%, white 57%, white)}


            .canvasWrapper {
                display: inline-block;
                position: fixed;
                right: 0;
                top: 0;
                width: 70%;
                height: 100vh;
            }

            .canvas {
                z-index: 1000;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            .activeCanvas {
                z-index: 1001;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            .canvasBackgroundImage{
                width: 70%;
                height: 100vh;
                position: fixed;
                right: 0;
                top: 0;
                object-position: center;
            }

            .nav--open {
                height: 100vh;
                width: 30%;
                background: var(--theme-background-color,rgb(218, 237, 231));
                box-shadow: 2px 2px 15px rgba(51, 51, 51, 0.1);
                position: fixed;
                top: 0;
                left: 0;
                z-index: 10;
            }

            .nav--open-title {
                font-family: "Playfair Display", serif;
                font-size: 0.8em;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                text-align: center;
                margin-top: 35%;
            }

            .nav--open-menu {
                height: 100%;
                display: flex;
                flex-direction: column;
                text-align: left;
                margin-top: 30px;
                margin-left: 30px;
            }
            .nav--open-menu span:not(.bubble-text, .mini-bubble) {
                font-size: 1.2em;
                font-weight: bold;
                font-family: "Playfair Display", serif;
                padding: 15px 0;
                color: var(--theme-color, #72ac9a);
            }

            .nav-section, .nav-subsection {
                margin-top: 20px;
            }

            .close {
                transform: translateX(-300px);
                transition: all 0.4s ease-out;
                opacity: 0;
            }

            section {
                height: 100vh;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }

            .two {
                background: #8fbdaf;
            }

            .three {
                background: var(--theme-color, #72ac9a);
            }

            h1 {
                font-family: "Abril Fatface", serif;
                margin: 0;
                font-weight: 50;
                color: var(--theme-color, #72ac9a);
                font-size: 1.5em;
            }
            h1 span {
                font-style: italic;
                text-decoration: underline;
                color: var(--theme-color, #72ac9a);
                font-size: 10px;
            }

            h6 {
                font-style: italic;
                color: var(--theme-color, #72ac9a);
                font-size: 15px;
                margin-top:10px;
                margin-bottom:10px;
            }

            .light {
                color: #b2d2c8;
            }

            .underline {
                text-decoration: underline;
            }

            .buttons {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
                width: 100%;
            }

            .button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 80px;
                height: 80px;
                flex-shrink: 0;
                margin: 20px;
            }

            .blossom-bow{
                border:none;
                background:transparent;
                padding:0;
                cursor:pointer;
                outline:none;

                transition: transform 120ms ease;
            }

            .bow-svg{
                width: 150px;
                height: auto;
                display:block;

                filter: drop-shadow(0 14px 18px rgba(0,0,0,0.18));
                transition: filter 120ms ease;
            }

            .blossom-bow:hover{
                transform: scale(1.04);
            }

            .blossom-bow:active{
                transform: scale(0.98);
            }

            .blossom-bow:active .bow-svg{
            filter:
                drop-shadow(0 14px 18px rgba(0,0,0,0.18))
                drop-shadow(0 0 22px rgba(255, 79, 147, 0.95))
                drop-shadow(0 0 45px rgba(255, 182, 193, 0.85));
            }

            .blossom-bow:focus-visible .bow-svg{
            filter:
                drop-shadow(0 14px 18px rgba(0,0,0,0.18))
                drop-shadow(0 0 18px rgba(255, 79, 147, 0.8));
            }

            h1 {
            font-size: 1.5rem;
            font-weight: 600;
            }

            .bubble-button {
            position: relative;
            width: 200px;
            height: 200px;

            border: none;
            background: transparent;
            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            animation: float 4s ease-in-out infinite;
            }


            .bubble {
            height: 120px;
            transition: transform 0.3s ease, filter 0.3s ease;
            }

            .bubble-button:hover .bubble {
            transform: scale(1.1);
            }

            .bubble-button:active .bubble {
            filter: drop-shadow(0 0 18px rgba(173, 216, 230, 0.9))
                    drop-shadow(0 0 35px rgba(173, 216, 230, 0.6));
            }
            .bubble-text {
            position: absolute;

            font-family: 'Great Vibes', cursive;
            font-size: 1rem;
            font-weight: 600;
            color: #063772;
            font-weight: 400;
            pointer-events: none;

            transform: translateX(8px); 
            }

            .mini-bubble {
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;

            background: radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.9),
                rgba(173, 216, 230, 0.7),
                rgba(173, 216, 230, 0.4)
            );

            opacity: 0;
            transform: scale(0);
            transition: all 0.4s ease;

            pointer-events: none; 
            }

            .b1 { top: -15px; left: 30px; }
            .b2 { top: 20px; right: -15px; }
            .b3 { bottom: -10px; left: 40px; }
            .b4 { bottom: 30px; right: 10px; }
            .b5 { bottom: 10px; left: 10px; }

            .bubble-button:hover .mini-bubble {
            opacity: 1;
            transform: scale(0.2);
            }
            .bubble-button:hover .b1 {
            transform: translate(-1px, -1px) scale(1.1);
            }

            .bubble-button:hover .b2 {
            transform: translate(1px, -1px) scale(1.1);
            }

            .bubble-button:hover .b3 {
            transform: translate(-1px, 1px) scale(1.1);
            }

            .bubble-button:hover .b4 {
            transform: translate(1px, 1px) scale(1.1);
            }
            .bubble-button:hover .b5 {
            transform: translate(1px, 1px) scale(1.1);
            }

            @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
            }

            @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

            .buttercup-button{
            transform: translateY(-25px);
            }
            
            .sunflower {
            width: 30vmin;
            height: 30vmin;
            position: relative;
            border: none;
            background: transparent;
            }

            .sunflower-center {
            border-radius: 50%;
            background-color: #b06500;
            background-image: linear-gradient(315deg, #b06500 0%, #5A321A 74%);
            transform: translate(-50%, -50%);
            position: absolute;
            left: 50%;
            z-index: 2;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 25%;
            height: 25%;
            }

            .sunflower-center h3 {
            margin: 0;
            color: #e4eec5;
            font-size: 2vmin;
            font-family: "Permanent Marker", cursive;
            font-weight: 400;
            text-align: center;
            z-index: 3;
            opacity: 1;
            }

            .hover-text {
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            color: #e4eec5;
            font-size: 1.5rem;
            font-family: "Permanent Marker", cursive;
            font-weight: 400;
            font-style: normal;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            transition: opacity 0.3s ease;
            width: 100%;
            margin-top: -10vh;
            }

            .sunflower-petal-1, .sunflower-petal-7, .sunflower-petal-12, .sunflower-petal-11, .sunflower-petal-10, .sunflower-petal-9, .sunflower-petal-8, .sunflower-petal-6, .sunflower-petal-5, .sunflower-petal-4, .sunflower-petal-3, .sunflower-petal-2 {
            border-radius: 50%;
            background: #7f9b2a;
            background: linear-gradient(90deg, rgba(127, 155, 42, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%);
            transform: translate(-50%, -50%);
            position: absolute;
            left: 50%;
            top: 50%;
            }

            .sunflower-petal-2 {
            transform: translate(-50%, -50%) rotate(30deg);
            }
            .sunflower-petal-3 {
            transform: translate(-50%, -50%) rotate(60deg);
            }
            .sunflower-petal-4 {
            transform: translate(-50%, -50%) rotate(90deg);
            }
            .sunflower-petal-5 {
            transform: translate(-50%, -50%) rotate(120deg);
            }
            .sunflower-petal-6 {
            transform: translate(-50%, -50%) rotate(150deg);
            }
            .sunflower-petal-7, .sunflower-petal-12, .sunflower-petal-11, .sunflower-petal-10, .sunflower-petal-9, .sunflower-petal-8 {
            border-radius: 20% 50% 20% 50%;
            transform: translate(-50%, -50%) rotate(15deg);
            }
            .sunflower-petal-8 {
            transform: translate(-50%, -50%) rotate(45deg);
            }
            .sunflower-petal-9 {
            transform: translate(-50%, -50%) rotate(75deg);
            }
            .sunflower-petal-10 {
            transform: translate(-50%, -50%) rotate(105deg);
            }
            .sunflower-petal-11 {
            transform: translate(-50%, -50%) rotate(135deg);
            }
            .sunflower-petal-12 {
            transform: translate(-50%, -50%) rotate(165deg);
            }

            .sunflower-petal-1:hover,
            .sunflower-petal-2:hover,
            .sunflower-petal-3:hover,
            .sunflower-petal-4:hover,
            .sunflower-petal-5:hover,
            .sunflower-petal-6:hover,
            .sunflower-petal-7:hover,
            .sunflower-petal-8:hover,
            .sunflower-petal-9:hover,
            .sunflower-petal-10:hover,
            .sunflower-petal-11:hover,
            .sunflower-petal-12:hover {
            background: radial-gradient(
                circle at center,
                #ffffff,
                #ffec00,
                #ff7f50,
                #ff4500,
                #8b0000
            );
            }

            .sunflower:hover .sunflower-petal-1,
            .sunflower:hover .sunflower-petal-2,
            .sunflower:hover .sunflower-petal-3,
            .sunflower:hover .sunflower-petal-4,
            .sunflower:hover .sunflower-petal-5,
            .sunflower:hover .sunflower-petal-6 {
            animation: grow-petal-back 1s 0s forwards;
            }

            .sunflower:hover .sunflower-petal-7,
            .sunflower:hover .sunflower-petal-8,
            .sunflower:hover .sunflower-petal-9,
            .sunflower:hover .sunflower-petal-10,
            .sunflower:hover .sunflower-petal-11,
            .sunflower:hover .sunflower-petal-12 {
            animation: grow-petal-front 1s 0.5s forwards;
            }

            .sunflower:hover ~ .hover-text {
            opacity: 0;
            }

            @keyframes grow-petal-front {
            0% {
                height: 0%;
                width: 0%;
                border: 0px solid black;
            }
            100% {
                height: 35%;
                width: 10%;
                border: 2px solid black;
            }
            }

            @keyframes grow-petal-back {
            0% {
                width: 0%;
                height: 0%;
                border: 0px solid black;
            }
            100% {
                width: 15%;
                height: 45%;
                border: 2px solid black;
            }
            }

            .undoButton, .clearButton, .printButton, .saveButton {
                font-size: 1.2em;
                color: var(--theme-color, #72ac9a);
            }
            .undoButton:hover, .clearButton:hover, .printButton:hover, .saveButton:hover {
                color: var(--theme-color, #72ac9a);
                opacity: 0.8;
            }

            .sticker-panel {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .sticker-thumb {
                width: 60px;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .sticker-thumb:hover {
                transform: scale(1.1);
            }

            .sticker {
                position: absolute;
                width: 120px;
                touch-action: none;
                cursor: grab;
                z-index: 2000;
            }

            .sticker-container {
                position: absolute;
                touch-action: none;
                cursor: grab;
                z-index: 2000;
            }

            .sticker-container .sticker {
                position: relative;
            }

            .sticker-close {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background-color: rgba(255, 255, 255, 0.9);
                border: 2px solid rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                color: rgba(0, 0, 0, 0.8);
                z-index: 2001;
                transition: all 0.2s ease;
                line-height: 1;
                opacity: 0;
                pointer-events: none;
            }

            .sticker-container:hover .sticker-close {
                opacity: 1;
                pointer-events: auto;
            }

            .sticker-close:hover {
                background-color: rgba(255, 0, 0, 0.9);
                color: white;
                border-color: rgba(255, 0, 0, 0.9);
                transform: scale(1.1);
            }

            @media (max-width: 1024px) {
                .hover-text {
                    display: none !important;
                }
            }

        `;
        this.shadowRoot.appendChild(style);

        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.type = 'text/css';
        this.shadowRoot.appendChild(fontAwesomeLink);

        const interactScript = document.createElement('script');
        interactScript.src = "https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js";
        this.shadowRoot.appendChild(interactScript);

        const cssAttr = this.getAttribute('css');
        if (cssAttr) {
            const link = document.createElement('link');
            link.href = cssAttr;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            this.shadowRoot.appendChild(link);
        }

        this.mainContentContainer = document.createElement('div');
        this.shadowRoot.appendChild(this.mainContentContainer);

        const maxBrushSize = this.getAttribute('maxbrushsize') || 32;
        const wrapperHTML = `
        <section>
            <div class="wrapper">
                <div class="nav--open sticky">
                    <div class="nav--open-menu">
                        <div class="title-container">
                            <h1>We are Group 5 ❀</h1> 
                            <h6>🌱 The buttons below represent each of us. Interact with them to learn about us through colours, sound, and stickers! PS: Make sure you're volume is on!</h6>
                            <h6>🌱 The paintings represent our team dynamics. Try to get to the final result using the colours and stickers!</h6>
                        </div>
                        <div class="nav-section">
                            <span href="">Colours</span>
                            <div class="palette nav-subsection"></div>
                        </div>
                        <div class="toolbar nav-subsection">
                            <div class="tools">
                                <input class="sizerTool input" type="range" min="1" max="${maxBrushSize}">
                                <div class="spacer"></div>
                                <button class="undoButton" aria-label="Undo"><i class="fas fa-undo"></i></button>
                                <button class="clearButton" aria-label="Clear"><i class="fas fa-trash"></i></button>
                                <button class="printButton" aria-label="Print"><i class="fas fa-print"></i></button>
                                <button class="saveButton" aria-label="Save"><i class="fas fa-save"></i></button>
                            </div>
                        </div>
                        <div class="nav-section">
                            <span href="">Stickers</span>
                            <div class="sticker-panel nav-subsection"></div>
                        </div>
                        <div class="nav-section">
                            <span href="">Other Paintings</span>
                            <div class="imageNav nav-subsection"></div>
                        </div>
                        <div class="nav-section buttons">
                            <div class="button">
                                <button class="blossom-bow" aria-label="Thi bow button">
                                    <svg class="bow-svg" viewBox="0 0 320 180" aria-hidden="true">
                                    <path d="M35,90
                                            C10,55 15,25 55,25
                                            C95,25 125,55 140,90
                                            C125,125 95,155 55,155
                                            C15,155 10,125 35,90 Z"
                                            fill="#ffb6c1" stroke="#ff4f93" stroke-width="8" />

                                    <path d="M285,90
                                            C310,55 305,25 265,25
                                            C225,25 195,55 180,90
                                            C195,125 225,155 265,155
                                            C305,155 310,125 285,90 Z"
                                            fill="#ffb6c1" stroke="#ff4f93" stroke-width="8" />

                                    <rect x="135" y="58" width="50" height="64" rx="14"
                                            fill="#ff8fb7" stroke="#ff2f7f" stroke-width="8" />

                                    <text x="160" y="98"
                                            text-anchor="middle"
                                            font-family="Arial, sans-serif"
                                            font-weight="800"
                                            font-size="20"
                                            fill="#7a0030">Thi</text>
                                    </svg>
                                </button>
                            </div>
                            <div class="button">
                                <button class="bubble-button">
                                    <img src="/assets/other/bubble.png" alt="bubble" class="bubble">
                                    <span class="bubble-text">Delaram</span>
                                    <span class="mini-bubble b1"></span>
                                    <span class="mini-bubble b2"></span>
                                    <span class="mini-bubble b3"></span>
                                    <span class="mini-bubble b4"></span>
                                    <span class="mini-bubble b5"></span>
                                </button>
                            </div>
                            <div class="button">
                                <div class="buttercup-button">
                                    <button class="sunflower">
                                        <div class="sunflower-center">
                                            <h3>Abi</h3>
                                        </div>
                                        <div class="sunflower-petal-1"></div>
                                        <div class="sunflower-petal-2"></div>
                                        <div class="sunflower-petal-3"></div>
                                        <div class="sunflower-petal-4"></div>
                                        <div class="sunflower-petal-5"></div>
                                        <div class="sunflower-petal-6"></div>
                                        <div class="sunflower-petal-7"></div>
                                        <div class="sunflower-petal-8"></div>
                                        <div class="sunflower-petal-9"></div>
                                        <div class="sunflower-petal-10"></div>
                                        <div class="sunflower-petal-11"></div>
                                        <div class="sunflower-petal-12"></div>
                                    </button>
                                    <div class="hover-text">Hover Over Me!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="canvasWrapper"></div>
            </div>
        </section>
        `;
        this.mainContentContainer.insertAdjacentHTML('beforeend', wrapperHTML);

        this.sizer = this.shadowRoot.querySelector('.sizerTool');
        this.wrapper = this.shadowRoot.querySelector('.wrapper');
        this.imageNav = this.shadowRoot.querySelector('.imageNav');
        this.palette = this.shadowRoot.querySelector('.palette');
        this.canvasWrapper = this.shadowRoot.querySelector('.canvasWrapper');
        this.titleElement = this.shadowRoot.querySelector('.title-container');

        this.sizer.addEventListener('input', this.updateSize.bind(this));
        this.shadowRoot.querySelector('.undoButton').addEventListener('click', () => {
            this.paths.pop();
            this.refresh();
        });
        this.shadowRoot.querySelector('.clearButton').addEventListener('click', () => {
            this.paths = [];
            localStorage.setItem(`v2:${this.getAttribute('src')}`, JSON.stringify(this.paths));
            this.refresh();
        });
        this.shadowRoot.querySelector('.printButton').addEventListener('click', this.print.bind(this));
        this.shadowRoot.querySelector('.saveButton').addEventListener('click', this.save.bind(this));

        const blossomButton = this.shadowRoot.querySelector('.blossom-bow');
        const bubbleButton = this.shadowRoot.querySelector('.bubble-button');
        const sunflowerButton = this.shadowRoot.querySelector('.sunflower');

        if (blossomButton) {
            blossomButton.addEventListener('click', () => {
                if (this.wrapper) {
                    this.wrapper.style.setProperty('--theme-color', '#fb6f92');
                    this.wrapper.style.setProperty('--theme-background-color', 'linear-gradient(221deg,rgba(255, 229, 236, 1) 0%, rgba(255, 194, 209, 1) 66%');
                }
                this.style.setProperty('--theme-color', '#fb6f92');
                this.style.setProperty('--theme-background-color', 'linear-gradient(221deg,rgba(255, 229, 236, 1) 0%, rgba(255, 194, 209, 1) 66%');
                
                this.paletteColors = [...this.themePalettes.blossom];
                this.generatePalette();
                
                if (this.titleElement) {
                    this.titleElement.innerHTML = this.themeTitles.blossom;
                }
                
                this.drawStickers('blossom');
            });
        }

        if (bubbleButton) {
            bubbleButton.addEventListener('click', () => {
                if (this.wrapper) {
                    this.wrapper.style.setProperty('--theme-color', '#6A89A7');
                    this.wrapper.style.setProperty('--theme-background-color', 'linear-gradient(221deg, #BDDDFC 0%, rgb(249, 249, 249) 66%');
                }
                this.style.setProperty('--theme-color', '#6A89A7');
                this.style.setProperty('--theme-background-color', 'linear-gradient(221deg, #BDDDFC 0%, rgb(249, 249, 249) 66%');
                
                this.paletteColors = [...this.themePalettes.bubble];
                this.generatePalette();
                
                if (this.titleElement) {
                    this.titleElement.innerHTML = this.themeTitles.bubble;
                }
                
                this.drawStickers('bubble');
            });
        }

        if (sunflowerButton) {
            sunflowerButton.addEventListener('click', () => {
                if (this.wrapper) {
                    this.wrapper.style.setProperty('--theme-color', '#66702a');
                    this.wrapper.style.setProperty('--theme-background-color', 'linear-gradient(221deg, #D4DE95 0%,rgb(255, 255, 255) 66%');
                }
                this.style.setProperty('--theme-color', '#66702a');
                this.style.setProperty('--theme-background-color', 'linear-gradient(221deg, #D4DE95 0%,rgb(255, 255, 255) 66%');
                
                this.paletteColors = [...this.themePalettes.sunflower];
                this.generatePalette();
                
                if (this.titleElement) {
                    this.titleElement.innerHTML = this.themeTitles.sunflower;
                }
                
                this.drawStickers('sunflower');
            });
        }

        this.generatePalette();
        this.drawImageNav();
        this.drawStickers();
    }

    generatePalette() {
        let customPaletteColors = [];
        const slotElements = this.slotsContainer.querySelector('slot').assignedElements();

        for (const el of slotElements) {
            if (el.tagName === 'I') {
                const color = el.getAttribute('color');
                if (color) {
                    customPaletteColors.push(color);
                }
            }
        }
        if (customPaletteColors.length) {
            this.paletteColors = customPaletteColors;
        }

        this.palette.innerHTML = '';
        let i = 0;
        for (const value of this.paletteColors) {
            const classesToAdd = ['paletteColor', `color${i}`];

            if (i === (this.paletteColors.length - 1)) {
                classesToAdd.push("eraser");
            }

            const paletteColorDiv = document.createElement('div');
            paletteColorDiv.classList.add(...classesToAdd);
            paletteColorDiv.style.backgroundColor = value;
            paletteColorDiv.setAttribute('data-color-index', i);

            paletteColorDiv.addEventListener('click', (e) => {
                this.color = parseInt(e.currentTarget.getAttribute('data-color-index'), 10);
                this.setCursor();
                this.palette.querySelectorAll('.paletteColor').forEach(pc => pc.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
            this.palette.appendChild(paletteColorDiv);
            i++;
        }
    }

    drawImageNav() {
        this.images = [];
        const slotElements = this.slotsContainer.querySelector('slot').assignedElements();

        for (const el of slotElements) {
            if (el.tagName === 'IMG') {
                this.images.push(el.getAttribute('data-lazy-src') || el.getAttribute('src'));
            }
        }

        this.imageNav.innerHTML = '';
        let sel = 0;
        let i = 0;
        if (this.hasAttribute('randomize')) {
            sel = Math.floor(Math.random() * this.images.length);
        }

        if (this.images.length > 1) {
            for (const src of this.images) {
                const imgElement = document.createElement('img');
                imgElement.src = src;
                imgElement.classList.add('image');
                imgElement.addEventListener('click', (e) => {
                    this.selectImage(e.currentTarget);
                });
                this.imageNav.appendChild(imgElement);
                if (sel === i) {
                    this.selectImage(imgElement);
                }
                i++;
            }
        } else if (this.images.length === 1) {
            const imgElement = document.createElement('img');
            imgElement.src = this.images[0];
            this.selectImage(imgElement);
        }
    }

    selectImage(sourceImgElement) {
        this.src = sourceImgElement.src;
        this.img = document.createElement('img');
        this.img.classList.add('canvasBackgroundImage');
        this.img.src = this.src;

        this.imageNav.querySelectorAll('.image').forEach(img => img.classList.remove('selected'));
        sourceImgElement.classList.add('selected');

        this.drawCanvas();
    }

    drawCanvas() {
        this.canvasWrapper.innerHTML = '';
        this.canvasWrapper.appendChild(this.img);

        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('canvas');
        this.canvasWrapper.appendChild(this.canvas);

        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.classList.add('activeCanvas');
        this.canvasWrapper.appendChild(this.activeCanvas);

        this.ctx = this.canvas.getContext('2d');
        this.activeCtx = this.activeCanvas.getContext('2d');

        this.img.onload = () => {
            this.sizeCanvas();
            const storedPaths = localStorage.getItem(`v2:${this.img.src}`);
            if (storedPaths) {
                try {
                    this.paths = JSON.parse(storedPaths);
                } catch (e) {
                    console.error("Error parsing stored paths, clearing data:", e);
                    this.paths = [];
                }
            } else {
                this.paths = [];
            }
            this.refresh();

            if (this.color === null) {
                const firstColor = this.shadowRoot.querySelector('.paletteColor.color1');
                if (firstColor) {
                    firstColor.click();
                }
            }
        };

        if (this.img.complete && this.img.naturalHeight !== 0) {
            this.img.onload();
        }

        this.activeCanvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.activeCanvas.addEventListener('mouseup', this.mouseUp.bind(this));
        this.activeCanvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.activeCanvas.addEventListener('touchstart', this.touchStart.bind(this), {
            passive: false
        });
        this.activeCanvas.addEventListener('touchend', this.touchEnd.bind(this));
        this.activeCanvas.addEventListener('touchmove', this.touchMove.bind(this), {
            passive: false
        });
    }

    touchStart(oe) {
        const e = oe;
        const touch = e.touches[0];
        e.clientX = touch.clientX;
        e.clientY = touch.clientY;
        this.mouseDown(e);
    }

    touchEnd(oe) {
        const e = oe;
        this.mouseUp(e);
    }

    touchMove(oe) {
        const e = oe;
        if (e.touches.length >= 2) return true;
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        e.clientX = touch.clientX;
        e.clientY = touch.clientY;
        this.mouseMove(e);
    }

    mouseDown(e) {
        const pos = this.getCursorPosition(e);
        this.dragging = true;
        pos.c = this.color;
        pos.s = this.sizer.value;
        this.paths.push([pos]);
        this.setCursor();
    }

    mouseUp(e) {
        this.commitActivePath();
        if (this.dragging) {
            localStorage.setItem(`v2:${this.getAttribute('src')}`, JSON.stringify(this.paths));
        }
        this.dragging = false;
    }

    mouseMove(e) {
        if (!this.dragging) return;
        const pos = this.getCursorPosition(e);
        this.paths[this.paths.length - 1].push(pos);
        this.drawActivePath();
    }

    updateSize() {
        this.setCursor();
    }

    async print() {
        const dataUrl = await this.getImageData();

        let windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Print Your Creation</title></head>';
        windowContent += '<body>';
        windowContent += '<img src="' + dataUrl + '" style="width:100%">';
        windowContent += '</body>';
        windowContent += '</html>';

        const printWin = window.open('', '', 'width=' + screen.availWidth + ',height=' + screen.availHeight);
        printWin.document.open();
        printWin.document.write(windowContent);

        printWin.document.addEventListener('load', function() {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();
        }, {
            once: true
        });
    }

    loadImage(url) {
        return new Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            });
            image.src = url;
        });
    }

    async getImageData() {
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.height = height;
        combinedCanvas.width = width;
        const c = combinedCanvas.getContext('2d');

        c.drawImage(this.img, 0, 0, width, height);

        const coloringData = await this.loadImage(this.canvas.toDataURL('image/png'));
        c.drawImage(coloringData, 0, 0, width, height);

        return combinedCanvas.toDataURL('image/png');
    }

    async save() {
    try {
        const dataUrl = await this.getImageData();

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = "ColoringBook.png";

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        console.log("Image saved successfully!");

    } catch (error) {
        console.error("Error saving image:", error);
        alert("Failed to save image. Please check the console for details.");
    }
    }

    sizeCanvas() {
        this.canvasPos = this.canvas.getBoundingClientRect();
        this.canvas.height = this.img.naturalHeight;
        this.canvas.width = this.img.naturalWidth;
        this.activeCanvas.height = this.img.naturalHeight;
        this.activeCanvas.width = this.img.naturalWidth;
    }

    getCursorPosition(e) {
        this.canvasPos = this.activeCanvas.getBoundingClientRect();
        const adjX = this.activeCanvas.width / this.canvasPos.width;
        const adjY = this.activeCanvas.height / this.canvasPos.height;

        return {
            x: (e.clientX - this.canvasPos.left) * adjX,
            y: (e.clientY - this.canvasPos.top) * adjY,
        };
    }

    commitActivePath() {
        this.drawActivePath(true);
    }

    clearActivePath() {
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        this.activeCtx.clearRect(0, 0, width, height);
    }

    drawActivePath(saveToCanvas = false) {
        this.clearActivePath();
        let ctx;
        const path = this.paths[this.paths.length - 1];

        if (!path || path.length < 1) return;

        if (saveToCanvas === true || path[0].c === (this.paletteColors.length - 1)) {
            ctx = this.ctx;
        } else {
            ctx = this.activeCtx;
        }

        if (path[0].c === null || path[0].c === undefined) {
            path[0].c = 0;
        }

        ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = path[0].s * (this.img.naturalWidth / this.img.width);

        if (path[0].c === (this.paletteColors.length - 1)) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = `white`;
        } else {
            ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let j = 1; j < path.length; ++j) {
            ctx.lineTo(path[j].x, path[j].y);
        }
        ctx.stroke();
    }

    refresh() {
        this.clearActivePath();
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < this.paths.length; ++i) {
            const path = this.paths[i];
            if (path.length < 1) continue;

            if (path[0].c === null || path[0].c === undefined) {
                path[0].c = 0;
            }

            ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = path[0].s * (this.img.naturalWidth / this.img.width);

            if (path[0].c === (this.paletteColors.length - 1)) {
                ctx.globalCompositeOperation = "destination-out";
                ctx.strokeStyle = `white`;
            } else {
                ctx.globalCompositeOperation = "source-over";
            }

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let j = 1; j < path.length; ++j) {
                ctx.lineTo(path[j].x, path[j].y);
            }
            ctx.stroke();
        }
    }

    setCursor() {
        const size = parseInt(this.sizer.value, 10);
        const effectiveSize = Math.max(2, Math.min(size, 32));
        const canvas = document.createElement('canvas');
        canvas.height = 32;
        canvas.width = 32;
        const context = canvas.getContext('2d');

        context.beginPath();
        context.arc(16, 16, effectiveSize / 2, 0, 2 * Math.PI, false);
        context.fillStyle = this.paletteColors[this.color];
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();

        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, 16);
        context.lineTo(32, 16);
        context.moveTo(16, 0);
        context.lineTo(16, 32);
        context.stroke();

        const url = canvas.toDataURL();
        this.wrapper.style.cursor = `url(${url}) 16 16, pointer`;
    }

    drawStickers(theme = null) {
        const panel = this.shadowRoot.querySelector('.sticker-panel');
        
        panel.innerHTML = '';
        
        if (!theme || !this.stickerConfigs[theme]) {
            const message = document.createElement('h6');
            message.textContent = 'Click on the buttons to see the stickers that represent us!';
            panel.appendChild(message);
            return;
        }
        
        const stickers = this.stickerConfigs[theme];
        
        stickers.forEach(stickerSrc => {
            const thumb = document.createElement('img');
            thumb.src = stickerSrc;
            thumb.className = "sticker-thumb";

            thumb.addEventListener('click', () => {
                this.addSticker(stickerSrc);
            });

            panel.appendChild(thumb);
        });
    }

    addSticker(src) {
        const container = document.createElement('div');
        container.className = "sticker-container";
        container.style.left = "50%";
        container.style.top = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.width = "120px";

        const sticker = document.createElement('img');
        sticker.src = src;
        sticker.className = "sticker";
        sticker.style.width = "100%";
        sticker.style.height = "auto";
        sticker.style.display = "block";

        const closeBtn = document.createElement('div');
        closeBtn.className = "sticker-close";
        closeBtn.textContent = "×";
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            container.remove();
        });

        container.appendChild(sticker);
        container.appendChild(closeBtn);

        this.canvasWrapper.appendChild(container);

        this.makeInteractive(container);
    }

    makeInteractive(target) {
        if (typeof window.interact === 'undefined') {
            console.warn('Interact.js not loaded yet, retrying...');
            setTimeout(() => this.makeInteractive(target), 100);
            return;
        }
        window.interact(target)
            .draggable({
                listeners: {
                    move(event) {
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rot') || 0}deg)`;

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move(event) {
                        let { width, height } = event.rect;
                        target.style.width = `${width}px`;
                        target.style.height = `${height}px`;
                    }
                }
            })
            .gesturable({
                listeners: {
                    move(event) {
                        const currentRotation = parseFloat(target.getAttribute('data-rot')) || 0;
                        const newRotation = currentRotation + event.da;

                        target.style.transform = `translate(
                            ${target.getAttribute('data-x') || 0}px,
                            ${target.getAttribute('data-y') || 0}px
                        ) rotate(${newRotation}deg)`;

                        target.setAttribute('data-rot', newRotation);
                    }
                }
            });
    }
});
