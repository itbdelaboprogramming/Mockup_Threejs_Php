import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { gsap } from "gsap";

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

// -- CSS Renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.left = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

const annotations = [
  {
    targetPoint: new THREE.Vector3(0, 1.2, 0.1),
    labelPosition: new THREE.Vector3(0, 3, 2),
    name: "Component 1",
  },
  {
    targetPoint: new THREE.Vector3(0.5, 0.5, 0.5),
    labelPosition: new THREE.Vector3(2, 1, 2),
    name: "Component 2",
  },
  {
    targetPoint: new THREE.Vector3(-0.4, 0.5, -0.4),
    labelPosition: new THREE.Vector3(-2, 1.5, -2),
    name: "Component 3",
  },
];

// -- Post Processing
let composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 0.8;
outlinePass.edgeThickness = 1.5;
outlinePass.visibleEdgeColor.set("#74e7d4");
outlinePass.hiddenEdgeColor.set("#74e7d4");
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);
let selectedObjectsForOutline = [];

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
let mixer;
let animationActions = [];
let allAnimationsPlaying = false;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
dracoLoader.setDecoderConfig({ type: "js" });
loader.setDRACOLoader(dracoLoader);

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

    // -- Animation
    animationActions = [];
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(load3D);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        // action.play();
        animationActions.push(action);
        if (allAnimationsPlaying) {
          action.play();
        }
      });
    }

    annotations.forEach((anno) => {
      const labelDiv = document.createElement("div");
      labelDiv.className = "annotation-label";
      labelDiv.textContent = anno.name;
      labelDiv.style.pointerEvents = "auto";
      labelDiv.style.cursor = "pointer";

      const label = new CSS2DObject(labelDiv);
      label.position.copy(anno.labelPosition);

      load3D.add(label);

      const points = [];
      points.push(anno.targetPoint.clone());
      points.push(anno.labelPosition.clone());

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        // linewidth: 30,
        // transparent: true,
        // opacity: 0,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);

      load3D.add(line);

      labelDiv.addEventListener("click", () => {
        const targetPoint = anno.targetPoint.clone();
        const targetWorldPosition = load3D.localToWorld(targetPoint.clone());

        const offsetDistance = 4;
        const direction = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
        if (direction.lengthSq() < 0.01) {
          direction.set(0, 0.5, 1).normalize();
        }
        const targetCameraPosition = targetWorldPosition.clone().addScaledVector(direction, offsetDistance);
        targetCameraPosition.y = Math.max(targetCameraPosition.y, targetWorldPosition.y + 1);

        const targetControlsTarget = targetWorldPosition;
        const duration = 1.2;

        // Hentikan animasi GSAP sebelumnya pada objek yang sama (penting!)
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(orbitControls.target);

        gsap.to(camera.position, {
          x: targetCameraPosition.x,
          y: targetCameraPosition.y,
          z: targetCameraPosition.z,
          duration: duration,
          ease: "power2.inOut", // Easing function
          onUpdate: function () {},
        });

        gsap.to(orbitControls.target, {
          x: targetControlsTarget.x,
          y: targetControlsTarget.y,
          z: targetControlsTarget.z,
          duration: duration,
          ease: "power2.inOut",
          onUpdate: function () {},
        });
      });
    });

    updateLightPosDisplay();
    populateSceneTree(load3D, "scene-tree");
  },
  function (error) {
    console.error(error);
  }
);

// -- Animation control
function playAllAnimations() {
  if (mixer && animationActions.length > 0) {
    animationActions.forEach((action) => {
      if (!action.isRunning()) {
        action.reset().play();
      }
    });
    allAnimationsPlaying = true;
  }
}

function stopAllAnimations() {
  if (mixer && animationActions.length > 0) {
    animationActions.forEach((action) => {
      action.stop();
    });
    allAnimationsPlaying = false;
  }
}

// -- UI event listener
const rotateBtn = document.getElementById("toggleRotateBtn");
const playAnimationButton = document.getElementById("playAnimationBtn");
const stopAnimationButton = document.getElementById("stopAnimationBtn");

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

if (playAnimationButton) {
  playAnimationButton.addEventListener("click", playAllAnimations);
}

if (stopAnimationButton) {
  stopAnimationButton.addEventListener("click", stopAllAnimations);
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
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }

  orbitControls.update();
  composer.render();
  // renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// -- Utilities
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
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
  if (object.isCSS2DObject || object.isLine) return;

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
          const targetObject = scene.getObjectByProperty("uuid", uuid);

          newContainer.querySelectorAll("li.selected").forEach((li) => {
            li.classList.remove("selected");
          });
          listItem.classList.add("selected");

          if (targetObject) {
            selectedObjectsForOutline = [targetObject];
          } else {
            selectedObjectsForOutline = [];
          }
          outlinePass.selectedObjects = selectedObjectsForOutline;

          if (listItem.classList.contains("is-parent")) {
            listItem.classList.toggle("expanded");
          }
        } else {
          newContainer.querySelectorAll("li.selected").forEach((li) => {
            li.classList.remove("selected");
          });
          selectedObjectsForOutline = [];
          outlinePass.selectedObjects = selectedObjectsForOutline;
        }
      }
    });
  } else return;
}

// --Start
animate();
