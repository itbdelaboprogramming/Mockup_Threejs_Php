import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { gsap } from "gsap";

let placedLabels = [];
let modelBoundingBox;
let currentModelId = null;
let placementModeActive = false;
let placementMarker = null;
let currentPlacementPoint = null;
let updatableAnnotations = [];

function initPlacementMode(model, camera, scene, renderer, orbitControls) {
    const placementModeBtn = document.getElementById('placementModeBtn');
    if (!placementModeBtn) return;

    if (!placementMarker) {
        const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
        placementMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        placementMarker.visible = false; 
        scene.add(placementMarker);
    }
    
    const onWindowMouseDown = (event) => {
        if (!placementModeActive) return;
        const canvasBounds = renderer.domElement.getBoundingClientRect();
        if (
            event.clientX < canvasBounds.left ||
            event.clientX > canvasBounds.right ||
            event.clientY > canvasBounds.bottom ||
            event.clientY < canvasBounds.top
        ) {return;}

        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);


        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            currentPlacementPoint = model.worldToLocal(intersectionPoint.clone());
            placementMarker.position.copy(intersectionPoint);
            placementMarker.visible = true;
            togglePlacementMode(); 
        }
    };

    const togglePlacementMode = () => {
        placementModeActive = !placementModeActive;
        if (placementModeActive) {
            placementModeBtn.classList.add('active');
            placementModeBtn.textContent = 'Placement Mode: ON (Click on Model)';
            document.body.classList.add('placement-mode-active');
            orbitControls.enabled = false;
            window.addEventListener('mousedown', onWindowMouseDown, false);
        } else {
            placementModeBtn.classList.remove('active');
            placementModeBtn.textContent = 'Click to Place Annotation';
            document.body.classList.remove('placement-mode-active');
            orbitControls.enabled = true;
            window.removeEventListener('mousedown', onWindowMouseDown, false);
        }
    };

    if (placementModeBtn) {
        placementModeBtn.addEventListener('click', togglePlacementMode);
    }
}

function createAndPlaceAnnotation(data, model, camera, scene, orbitControls, userRole) {
    const { id, name, targetPoint, labelPosition } = data;
    const labelRadius = 1.5; 
    const targetWorldPosition = model.localToWorld(targetPoint.clone());
    let bestCandidate = null;

    if (labelPosition) {
        bestCandidate = labelPosition;
    } else {
        if (!modelBoundingBox) {modelBoundingBox = new THREE.Box3().setFromObject(model);}
        const modelCenter = modelBoundingBox.getCenter(new THREE.Vector3());
        const placementRadius = (modelBoundingBox.getSize(new THREE.Vector3()).length() / 7) + 3; 
        const candidates = [];
        const rings = 5; 
        const pointsPerRing = 16; 

        for (let i = 0; i <= rings; i++) {
            const phi = Math.PI * (i / rings);
            for (let j = 0; j < pointsPerRing; j++) {
            const theta = 2 * Math.PI * (j / pointsPerRing);
            const position = new THREE.Vector3();
            position.setFromSphericalCoords(placementRadius, phi, theta);
            position.add(modelCenter);
            candidates.push(position);
            }
        }

        let highestScore = -Infinity;
        const raycaster = new THREE.Raycaster();

        for (const candidate of candidates) {
            let score = 0;
            const candidateSphere = new THREE.Sphere(candidate, labelRadius);
            const collision = placedLabels.some(label => candidateSphere.intersectsSphere(label.sphere));
            if (collision) { score -= 1000; }

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
    }

    const labelDiv = document.createElement("div");
    labelDiv.className = "annotation-label";
    labelDiv.dataset.annotationId = id; 
    const textSpan = document.createElement("span");
    textSpan.className = "annotation-text";
    textSpan.textContent = name;
    
    labelDiv.appendChild(textSpan);

    if (userRole === 'admin') {
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "annotation-buttons";
        const moveBtn = document.createElement("button");
        moveBtn.textContent = "✥"; 
        moveBtn.className = "annotation-move-btn";
        moveBtn.title = "Move Label"; 
        const editBtn = document.createElement("button");
        editBtn.textContent = "✎"; 
        editBtn.className = "annotation-edit-btn";
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑"; 
        deleteBtn.className = "annotation-delete-btn";

        buttonsDiv.appendChild(moveBtn);
        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);
        labelDiv.appendChild(buttonsDiv);
    
        // Drag and Drop, Edit, Delete (Admin Only)
        moveBtn.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            orbitControls.enabled = false;

            const plane = new THREE.Plane();
            const planeNormal = camera.position.clone().sub(label.position).normalize();
            plane.setFromNormalAndCoplanarPoint(planeNormal, label.position);
            
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const intersection = new THREE.Vector3();

            function onMouseMove(moveEvent) {
                mouse.x = (moveEvent.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(moveEvent.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);

                if (raycaster.ray.intersectPlane(plane, intersection)) {
                    label.position.copy(intersection);
                    const positions = line.geometry.attributes.position.array;
                    positions[3] = intersection.x;
                    positions[4] = intersection.y;
                    positions[5] = intersection.z;
                    line.geometry.attributes.position.needsUpdate = true;
                }
            }

            async function onMouseUp() {
                orbitControls.enabled = true;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                try {
                    const response = await fetch('../pages/update_annotation.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: label.userData.id,
                            label_pos: {
                                x: label.position.x,
                                y: label.position.y,
                                z: label.position.z,
                            }
                        })
                    });
                    const result = await response.json();
                    if (!result.success) {
                       console.error('Failed to save label position:', result.error);
                    }
                } catch (error) {
                    console.error('Error saving label position:', error);
                }
            }

            window.addEventListener('mousemove', onMouseMove, false);
            window.addEventListener('mouseup', onMouseUp, false);
        });
        
        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation(); 
            if (!confirm(`Are you sure you want to delete annotation "${textSpan.textContent}"?`)) {
                return;
            }
            
            try {
                const response = await fetch('../pages/delete_annotation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });
                const result = await response.json();
                
                if (result.success) {
                    scene.remove(label);
                    scene.remove(line);
                    console.log(`Annotation ${id} deleted.`);
                } else {
                    alert('Error deleting annotation: ' + result.error);
                }
            } catch (error) {
                alert('Failed to connect to server.');
                console.error("Delete error:", error);
            }
        });

        editBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            const newText = prompt("Enter new label text:", textSpan.textContent);
            
            if (newText && newText.trim() !== "" && newText !== textSpan.textContent) {
                try {
                    const response = await fetch('../pages/update_annotation.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: id, label_text: newText })
                    });
                    const result = await response.json();
                    
                    if (result.success) {
                        textSpan.textContent = newText;
                        console.log(`Annotation ${id} updated.`);
                    } else {
                        alert('Error updating annotation: ' + result.error);
                    }
                } catch (error) {
                    alert('Failed to connect to server.');
                    console.error("Update error:", error);
                }
            }
        });
    }
    
    textSpan.addEventListener("click", () => {
        const offsetDistance = 4;
        const direction = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
        const targetCameraPosition = targetWorldPosition.clone().addScaledVector(direction, offsetDistance);
        targetCameraPosition.y = Math.max(targetCameraPosition.y, targetWorldPosition.y + 1);
        gsap.to(camera.position, { ...targetCameraPosition, duration: 1.2, ease: "power2.inOut" });
        gsap.to(orbitControls.target, { ...targetWorldPosition, duration: 1.2, ease: "power2.inOut" });
    });

    const label = new CSS2DObject(labelDiv);
    label.position.copy(bestCandidate);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const points = [targetWorldPosition, bestCandidate];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    
    scene.add(label);
    scene.add(line);

    updatableAnnotations.push({ label: label, line: line})
    
    label.userData = { line: line, target: targetWorldPosition, id: id };
    placedLabels.push({ position: bestCandidate, sphere: new THREE.Sphere(bestCandidate, labelRadius) });
}

async function fetchAndRenderAnnotations(model, camera, scene, orbitControls, userRole) {
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
                id: anno.id, 
                name: anno.label_text,
                targetPoint: new THREE.Vector3(
                    parseFloat(anno.target_x),
                    parseFloat(anno.target_y),
                    parseFloat(anno.target_z)
                ),
                labelPosition: (anno.label_pos_x !== null && anno.label_pos_y !== null && anno.label_pos_z !== null)
                    ? new THREE.Vector3(
                        parseFloat(anno.label_pos_x),
                        parseFloat(anno.label_pos_y),
                        parseFloat(anno.label_pos_z)
                      )
                    : null
            };
            createAndPlaceAnnotation(annotationData, model, camera, scene, orbitControls, userRole);
        });
    } catch (error) {
        console.error("Failed to fetch annotations:", error);
    }
}

function initAnnotationCreator(model, camera, scene, orbitControls, renderer, userRole) {
    if (userRole !== 'admin') {
        return; 
    }
    initPlacementMode(model, camera, scene, renderer, orbitControls);

    const addBtn = document.getElementById('addAnnotationBtn');
    const feedbackEl = document.getElementById('annotation-feedback');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const text = document.getElementById('anno_text').value;
            feedbackEl.textContent = '';

            if (!text || !currentPlacementPoint) {
                feedbackEl.textContent = 'Please place a point on the model and enter a label text.';
                return;
            }

            const newAnnotationData = {
                model_id: currentModelId,
                label_text: text,
                target_point: { 
                    x: currentPlacementPoint.x, 
                    y: currentPlacementPoint.y, 
                    z: currentPlacementPoint.z 
                }
            };

            try {
                const response = await fetch('save_annotation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newAnnotationData),
                });
                const result = await response.json();

                if (result.success) {
                    createAndPlaceAnnotation({
                        id: result.id,
                        name: newAnnotationData.label_text,
                        targetPoint: new THREE.Vector3(
                            currentPlacementPoint.x,
                            currentPlacementPoint.y,
                            currentPlacementPoint.z
                        ),
                        labelPosition: null 
                    }, model, camera, scene, orbitControls, userRole);
                    
                    document.getElementById('anno_text').value = '';

                    currentPlacementPoint = null; 
                    if(placementMarker) placementMarker.visible = false;

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

function setupInitialAnnotations(model, camera, scene, orbitControls, userRole) {
  placedLabels = [];
  modelBoundingBox = null;
  fetchAndRenderAnnotations(model, camera, scene, orbitControls, userRole);
}

function updateAnnotationsVisibility(camera) {
    const ANNOTATION_MAX_DISTANCE = 50; 

    updatableAnnotations.forEach(anno => {
        const distance = camera.position.distanceTo(anno.label.position);

        if (distance < ANNOTATION_MAX_DISTANCE) {
            anno.label.visible = true;
            anno.line.visible = true;
        } else {
            anno.label.visible = false;
            anno.line.visible = false;
        }
    });
}

export { setupInitialAnnotations, initAnnotationCreator, updateAnnotationsVisibility };