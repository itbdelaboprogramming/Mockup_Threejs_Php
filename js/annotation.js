import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { gsap } from "gsap";

// const initialAnnotations = [
//   { targetPoint: new THREE.Vector3(0, 1.2, 0.1), name: "Component 1" },
//   { targetPoint: new THREE.Vector3(0.5, 0.5, 0.5), name: "Component 2" },
//   { targetPoint: new THREE.Vector3(-0.4, 0.5, -0.4), name: "Component 3" },
// ];

let placedLabels = []; 
let modelBoundingBox;
let currentModelId = null;

function createAndPlaceAnnotation(data, model, camera, scene, orbitControls) {
  const { name, targetPoint } = data;
  const labelRadius = 1.5; 

  const targetWorldPosition = model.localToWorld(targetPoint.clone());
  if (!modelBoundingBox) {
    modelBoundingBox = new THREE.Box3().setFromObject(model);
  }
  const modelCenter = modelBoundingBox.getCenter(new THREE.Vector3());
  const placementRadius = (modelBoundingBox.getSize(new THREE.Vector3()).length() / 7) + 3; 

  const candidates = [];
  const rings = 5; 
  const pointsPerRing = 16; 

  for (let i = 0; i <= rings; i++) {
    const phi = Math.PI * (i / rings); // Sudut vertikal
    for (let j = 0; j < pointsPerRing; j++) {
      const theta = 2 * Math.PI * (j / pointsPerRing); // Sudut horizontal

      const position = new THREE.Vector3();
      position.setFromSphericalCoords(placementRadius, phi, theta);
      position.add(modelCenter);
      candidates.push(position);
    }
  }

  let bestCandidate = null;
  let highestScore = -Infinity;
  const raycaster = new THREE.Raycaster();

  for (const candidate of candidates) {
    let score = 0;
    const candidateSphere = new THREE.Sphere(candidate, labelRadius);

    // Coallision Check
    const collision = placedLabels.some(label => candidateSphere.intersectsSphere(label.sphere));
    if (collision) {
      score -= 1000;
    }

    // Model Intersection Check
    raycaster.set(camera.position, candidate.clone().sub(camera.position).normalize());
    const intersects = raycaster.intersectObject(model, true);
    if (intersects.length > 0 && intersects[0].distance < camera.position.distanceTo(candidate) - 0.1) {
      score -= 500;
    }
    
    const distToTarget = candidate.distanceTo(targetWorldPosition);
    score -= distToTarget * 10;
    score += candidate.y * 5;

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    bestCandidate = modelCenter.clone().add(new THREE.Vector3(0, placementRadius, 0));
  }

  bestCandidate.y = Math.max(bestCandidate.y, 0.2); 
  placedLabels.push({
      position: bestCandidate,
      sphere: new THREE.Sphere(bestCandidate, labelRadius)
  });

  const labelDiv = document.createElement("div");
  labelDiv.className = "annotation-label";
  labelDiv.textContent = name;
  const label = new CSS2DObject(labelDiv);
  label.position.copy(bestCandidate);
  scene.add(label);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const points = [targetWorldPosition, bestCandidate];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  labelDiv.addEventListener("click", () => {
    const offsetDistance = 4;
    const direction = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
    const targetCameraPosition = targetWorldPosition.clone().addScaledVector(direction, offsetDistance);
    targetCameraPosition.y = Math.max(targetCameraPosition.y, targetWorldPosition.y + 1);
    gsap.to(camera.position, { ...targetCameraPosition, duration: 1.2, ease: "power2.inOut" });
    gsap.to(orbitControls.target, { ...targetWorldPosition, duration: 1.2, ease: "power2.inOut" });
  });
}

async function fetchAndRenderAnnotations(model, camera, scene, orbitControls) {
    const urlParams = new URLSearchParams(window.location.search);
    currentModelId = urlParams.get('model');

    if (!currentModelId) return;
    try {
        const response = await fetch(`get_annotations.php?model_id=${currentModelId}`);
        const annotations = await response.json();

        if (annotations.error) {
            console.error("Error fetching annotations:", annotations.error);
            return;
        }

        annotations.forEach(anno => {
            const annotationData = {
                name: anno.label_text,
                targetPoint: new THREE.Vector3(
                    parseFloat(anno.target_x),
                    parseFloat(anno.target_y),
                    parseFloat(anno.target_z)
                )
            };
            createAndPlaceAnnotation(annotationData, model, camera, scene, orbitControls);
        });
    } catch (error) {
        console.error("Failed to fetch annotations:", error);
    }
}

function initAnnotationCreator(model, camera, scene, orbitControls) {
    const addBtn = document.getElementById('addAnnotationBtn');
    const feedbackEl = document.getElementById('annotation-feedback');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const text = document.getElementById('anno_text').value;
            const x = parseFloat(document.getElementById('anno_x').value);
            const y = parseFloat(document.getElementById('anno_y').value);
            const z = parseFloat(document.getElementById('anno_z').value);

            feedbackEl.textContent = '';

            if (!text || isNaN(x) || isNaN(y) || isNaN(z)) {
                feedbackEl.textContent = 'Please fill all fields correctly.';
                return;
            }

            const newAnnotationData = {
                model_id: currentModelId,
                label_text: text,
                target_point: { x, y, z }
            };

            try {
                const response = await fetch('save_annotation.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newAnnotationData),
                });
                const result = await response.json();

                if (result.success) {
                    createAndPlaceAnnotation({
                        name: newAnnotationData.label_text,
                        targetPoint: new THREE.Vector3(x,y,z)
                    }, model, camera, scene, orbitControls);
                    
                    document.getElementById('anno_text').value = '';
                    document.getElementById('anno_x').value = '';
                    document.getElementById('anno_y').value = '';
                    document.getElementById('anno_z').value = '';
                    feedbackEl.textContent = 'Annotation saved!';
                    setTimeout(() => feedbackEl.textContent = '', 2000);
                } else {
                    feedbackEl.textContent = 'Error saving: ' + (result.error || 'Unknown error');
                }
            } catch (error) {
                feedbackEl.textContent = 'Failed to connect to server.';
                console.error("Error saving annotation:", error);
            }
        });
    }
}

function setupInitialAnnotations(model, camera, scene, orbitControls) {
  placedLabels = [];
  modelBoundingBox = null;
  fetchAndRenderAnnotations(model, camera, scene, orbitControls);
}

export { setupInitialAnnotations, initAnnotationCreator };