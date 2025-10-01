import * as THREE from "three";

function setupEnvironment(scene) {
  // Grid Helper
  const grid = new THREE.GridHelper(30, 30, 0x666666, 0x666666);
  grid.position.y = -0.9;
  scene.add(grid);

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(30, 30);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.91;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);
}

export { setupEnvironment };