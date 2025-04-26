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
      }
    });
    scene.add(load3D);
    load3D.position.set(0, -0.9, 0);
    // load3D.scale.set(2, 2, 2);

    updateLightPosDisplay();
    populateSceneTree(load3D, "scene-tree");
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

// -- Working Tree
function populateSceneTree(root, treeElementId) {
  const treeContainer = document.getElementById(treeElementId);
  if (treeContainer) {
    treeContainer.innerHTML = "";
    root.children.forEach((child) => {
      buildTree(child, treeContainer);
    });
    addTree(treeElementId);
  } else {
    console.log("element with ID " + treeElementId + " not found.");
    return;
  }
}

function buildTree(object, parent) {
  const listItem = document.createElement("li");
  listItem.dataset.uuid = object.uuid;

  if (object.children.length > 0) {
    listItem.classList.add("is-parent");
  }
  // parent.appendChild(listItem);

  const visIcon = document.createElement("span");
  visIcon.classList.add("vis-icon");
  if (object.visible) {
    visIcon.classList.add("visible");
    visIcon.textContent = "V";
  } else {
    visIcon.classList.add("hidden");
    visIcon.textContent = "X";
  }
  listItem.appendChild(visIcon);

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("node-name");
  nameSpan.textContent = object.name;
  listItem.appendChild(nameSpan);

  parent.appendChild(listItem);

  if (object.children.length > 0) {
    const childList = document.createElement("ul");
    listItem.appendChild(childList);
    object.children.forEach((child) => {
      buildTree(child, childList);
    });
  }
}

function addTree(treeElementId) {
  const treeContainer = document.getElementById(treeElementId);
  if (treeContainer) {
    const newContainer = treeContainer.cloneNode(false);
    while (treeContainer.firstChild) {
      newContainer.appendChild(treeContainer.firstChild);
    }
    treeContainer.parentNode.replaceChild(newContainer, treeContainer);

    newContainer.addEventListener("click", (event) => {
      if (event.target.matches(".vis-icon")) {
        const icon = event.target;
        const uuid = icon.closest("li[data-uuid]").dataset.uuid;
        if (!uuid) return;

        const targetObject = scene.getObjectByProperty("uuid", uuid);
        if (targetObject) {
          targetObject.visible = !targetObject.visible;
          icon.classList.toggle("visible", targetObject.visible);
          icon.classList.toggle("hidden", !targetObject.visible);
          icon.textContent = targetObject.visible ? "V" : "X";
        }
      } else {
        const listItem = event.target.closest("li[data-uuid]");
        if (listItem) {
          const uuid = listItem.dataset.uuid;
          newContainer.querySelectorAll("li.selected").forEach((li) => {
            li.classList.remove("selected");
          });
          listItem.classList.add("selected");

          if (listItem.classList.contains("is-parent")) {
            listItem.classList.toggle("expanded");
          }
        }
      }
    });
  } else return;
}

// --Start
animate();
