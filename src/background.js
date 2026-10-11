import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('webgl-container');
const stage = document.querySelector('.architecture-stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (container && stage) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 8.7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.95, 0.52, 0.2);
  composer.addPass(bloom);

  const root = new THREE.Group();
  root.position.set(0.25, -0.1, 0);
  root.rotation.set(-0.2, -0.42, 0);
  scene.add(root);

  const ambient = new THREE.HemisphereLight(0xc9ddff, 0x12101f, 1.7);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0xd7ff4f, 24, 18, 2);
  keyLight.position.set(-3.5, 3.5, 4);
  scene.add(keyLight);
  const violetLight = new THREE.PointLight(0x8568ff, 18, 15, 2);
  violetLight.position.set(4, -2, 2);
  scene.add(violetLight);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(5.35, 4.25, 2.85)),
    new THREE.LineBasicMaterial({ color: 0x6a7388, transparent: true, opacity: 0.26 })
  );
  frame.scale.setScalar(0.82);
  root.add(frame);

  const core = new THREE.Group();
  root.add(core);

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x252a39,
    metalness: 0.82,
    roughness: 0.27,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    transparent: true,
    opacity: 0.89
  });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x9ca7bd, transparent: true, opacity: 0.58 });
  const activeMaterial = new THREE.MeshBasicMaterial({ color: 0xd7ff4f, transparent: true, opacity: 0.96 });
  const violetMaterial = new THREE.MeshBasicMaterial({ color: 0x987cff, transparent: true, opacity: 0.9 });

  function createServer(position, accent, scale = 1) {
    const module = new THREE.Group();
    module.position.copy(position);
    module.scale.setScalar(scale);

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.52, 1.22), shellMaterial);
    module.add(body);

    const bodyEdges = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), edgeMaterial);
    module.add(bodyEdges);

    const front = new THREE.Group();
    front.position.z = 0.625;
    for (let i = 0; i < 4; i += 1) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.055, 0.025), i === 0 ? accent : new THREE.MeshBasicMaterial({ color: 0x8791a8, transparent: true, opacity: 0.56 }));
      stripe.position.set(-0.75 + i * 0.5, 0.02, 0);
      front.add(stripe);
    }
    const port = new THREE.Mesh(new THREE.CircleGeometry(0.065, 18), accent);
    port.position.set(1.02, 0.02, 0.02);
    front.add(port);
    module.add(front);

    const glow = new THREE.PointLight(accent.color, 2.6, 3.2);
    glow.position.set(-0.8, 0, 1.1);
    module.add(glow);
    return module;
  }

  const servers = [
    createServer(new THREE.Vector3(0, 1.16, 0), activeMaterial, 1.04),
    createServer(new THREE.Vector3(0, 0, 0), violetMaterial),
    createServer(new THREE.Vector3(0, -1.16, 0), activeMaterial, 0.96)
  ];
  servers.forEach((server) => core.add(server));

  const coreOrb = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.52, 2),
    new THREE.MeshPhysicalMaterial({ color: 0x202b2e, metalness: 0.3, roughness: 0.2, emissive: 0x4d7313, emissiveIntensity: 0.75, transparent: true, opacity: 0.94 })
  );
  const orbWire = new THREE.LineSegments(new THREE.EdgesGeometry(orb.geometry), new THREE.LineBasicMaterial({ color: 0xd7ff4f, transparent: true, opacity: 0.58 }));
  coreOrb.add(orb, orbWire);
  coreOrb.position.set(0.2, 0.05, 1.17);
  root.add(coreOrb);

  const rings = new THREE.Group();
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x8a75ff, transparent: true, opacity: 0.38, side: THREE.DoubleSide });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.018, 6, 96), ringMaterial);
  ringA.rotation.set(0.96, 0.2, 0.5);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.014, 6, 96), new THREE.MeshBasicMaterial({ color: 0xd7ff4f, transparent: true, opacity: 0.44 }));
  ringB.rotation.set(-1.08, 0.58, -0.4);
  rings.add(ringA, ringB);
  root.add(rings);

  const dataRoutes = new THREE.Group();
  const packets = [];
  function addRoute(points, color, speed, offset) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32 })
    );
    dataRoutes.add(line);
    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
    );
    dataRoutes.add(packet);
    packets.push({ curve, mesh: packet, speed, offset });
  }

  addRoute([new THREE.Vector3(-2.2, 1.6, 0.1), new THREE.Vector3(-1.2, 2.2, 0.8), new THREE.Vector3(0.3, 1.25, 1.1), new THREE.Vector3(1.9, 1.6, 0.05)], 0xd7ff4f, 0.0001, 0.2);
  addRoute([new THREE.Vector3(-2.25, -1.5, 0.1), new THREE.Vector3(-1.35, -2.05, 0.8), new THREE.Vector3(0.25, -1.15, 1.1), new THREE.Vector3(2.2, -1.35, 0.05)], 0x8d79ff, 0.00013, 0.66);
  addRoute([new THREE.Vector3(-2.25, 0, -0.1), new THREE.Vector3(-1.15, 0.88, 0.55), new THREE.Vector3(0.86, -0.98, 0.8), new THREE.Vector3(2.35, 0.1, -0.1)], 0xb4eff0, 0.00008, 0.45);
  root.add(dataRoutes);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = window.innerWidth < 680 ? 48 : 86;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 7.6;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6.6;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.2 - 1;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0xcdd3e2, size: 0.027, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(particles);

  const mouse = new THREE.Vector2();
  const desiredRotation = new THREE.Vector2(-0.2, -0.42);
  stage.addEventListener('pointermove', (event) => {
    const bounds = stage.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    mouse.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    desiredRotation.set(-0.2 + mouse.y * 0.13, -0.42 + mouse.x * 0.28);
  }, { passive: true });
  stage.addEventListener('pointerleave', () => desiredRotation.set(-0.2, -0.42), { passive: true });

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
  }
  new ResizeObserver(resize).observe(container);
  resize();

  let raf = null;
  let pageVisible = !document.hidden;
  function render(time = 0) {
    if (!pageVisible) return;
    raf = requestAnimationFrame(render);
    const motion = reduceMotion ? 0 : time;
    root.rotation.x += (desiredRotation.x - root.rotation.x) * 0.035;
    root.rotation.y += (desiredRotation.y - root.rotation.y) * 0.035;
    root.position.y = -0.1 + Math.sin(motion * 0.0007) * 0.085;
    core.rotation.y = Math.sin(motion * 0.00042) * 0.09;
    coreOrb.rotation.x = motion * 0.00045;
    coreOrb.rotation.y = motion * 0.00066;
    rings.rotation.z = motion * 0.00018;
    ringB.rotation.z = -0.4 + motion * 0.00028;
    servers.forEach((server, index) => {
      server.position.x = Math.sin(motion * 0.00085 + index * 2.2) * 0.06;
    });
    packets.forEach(({ curve, mesh, speed, offset }) => {
      mesh.position.copy(curve.getPointAt((motion * speed + offset) % 1));
    });
    particles.rotation.z = motion * 0.000025;
    composer.render();
  }
  render();

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (!pageVisible && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    if (pageVisible && !raf) render();
  });
}
