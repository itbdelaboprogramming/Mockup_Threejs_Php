import * as THREE from "three";

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(-4, 15, 12);
directionalLight.castShadow = true;

function setupLighting(scene) {
  scene.add(ambientLight);
  scene.add(directionalLight);
}

export { setupLighting, directionalLight };