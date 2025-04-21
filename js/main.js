import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// -- Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// -- Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position.set(-7, 4, 5);
let isAutoRotate = false;

// -- Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// -- Orbit Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.1;
orbitControls.autoRotate = false;

// -- Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(-4, 15, 12);
directionalLight.castShadow = true;
scene.add(directionalLight);

// -- Grid Helper
const gridSize = 30;
const gridDivisions = 30;
const colorCenterLine = 0x666666;
const colorGrid = 0x666666;
const grid = new THREE.GridHelper(gridSize, gridDivisions, colorCenterLine, colorGrid);
grid.position.y = -0.9;
scene.add(grid);

// -- Floor
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -0.91;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// -- Model Loading
const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get("model");
const modelToLoad = modelId;

const modelPath = `../assets/model/${modelToLoad}.glb`;
console.log(`Load model: ${modelPath}`);

let load3D = null;
const loader = new GLTFLoader();
loader.load(
  modelPath,
  function (gltf) {
    load3D = gltf.scene;
    load3D.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(load3D);
    load3D.position.set(0, -0.9, 0);
    // load3D.scale.set(2, 2, 2);

    updateLightPosDisplay();
  },
  function (error) {
    console.error(error);
  }
);

// -- UI event listener
const rotateBtn = document.getElementById("toggleRotateBtn");
const lightPosDisplay = document.getElementById("lightPosDisplay");
const lightSliderX = document.getElementById("lightSliderX");
const lightValueX = document.getElementById("lightValueX");
const lightSliderY = document.getElementById("lightSliderY");
const lightValueY = document.getElementById("lightValueY");
const lightSliderZ = document.getElementById("lightSliderZ");
const lightValueZ = document.getElementById("lightValueZ");

if (rotateBtn) {
  rotateBtn.addEventListener("click", () => {
    isAutoRotate = !isAutoRotate;
    orbitControls.autoRotate = isAutoRotate;
  });
}

// -- Update direct light
function updateLightPosDisplay() {
  if (lightPosDisplay && directionalLight) {
    const pos = directionalLight.position;
    lightPosDisplay.textContent = `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
  }
}

if (lightSliderX && lightValueX) {
  lightValueX.textContent = lightSliderX.value;
  lightSliderX.addEventListener("input", (event) => {
    const xValue = parseFloat(event.target.value);
    directionalLight.position.x = xValue;
    lightValueX.textContent = xValue;
    updateLightPosDisplay();
  });
}

if (lightSliderY && lightValueY) {
  lightValueY.textContent = lightSliderY.value;
  lightSliderY.addEventListener("input", (event) => {
    const yValue = parseFloat(event.target.value);
    directionalLight.position.y = yValue;
    lightValueY.textContent = yValue;
    updateLightPosDisplay();
  });
}

if (lightSliderZ && lightValueZ) {
  lightValueZ.textContent = lightSliderZ.value;
  lightSliderZ.addEventListener("input", (event) => {
    const zValue = parseFloat(event.target.value);
    directionalLight.position.z = zValue;
    lightValueZ.textContent = zValue;
    updateLightPosDisplay();
  });
}

// -- Animation loop
function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();
  renderer.render(scene, camera);
}

// -- Utilities
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

// --Start
animate();
console.log(`Three.js version: ${THREE.REVISION}`);
