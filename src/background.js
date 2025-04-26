import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let camera, controls, scene, renderer;
const frustumSize = 1000;
let assetsLoaded = false;

// Initialize loading screen handling
const loadingScreen = document.getElementById('loadingScreen');

init();
animate();

function init() {
    // Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 2000);
    camera.position.z = 800;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111133);
    scene.fog = new THREE.FogExp2(0x111133, 0.0007);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    const colors = [];

    const color = new THREE.Color();
    const colorOptions = [0x4fc3f7, 0x81d4fa, 0x29b6f6, 0x0288d1];

    for (let i = 0; i < 1500; i++) {
        vertices.push((Math.random() - 0.5) * 2000);
        vertices.push((Math.random() - 0.5) * 2000);
        vertices.push((Math.random() - 0.5) * 2000);

        sizes.push(Math.random() * 10 + 5);

        const colorIndex = Math.floor(Math.random() * colorOptions.length);
        color.setHex(colorOptions[colorIndex]);
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Shader material for particles
    const material = new THREE.PointsMaterial({
        size: 15,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.3;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.05;

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading screen after everything is initialized
    // We'll use a slight delay to ensure everything is rendered
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            // Remove from DOM after transition completes
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        assetsLoaded = true;
    }, 1500); // Adjust this delay as needed
}

function onWindowResize() {
    // ... existing code ...
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    // Slowly rotate the scene for a more dynamic background
    scene.rotation.y += 0.0008;
    scene.rotation.x += 0.0004;
    
    renderer.render(scene, camera);
}