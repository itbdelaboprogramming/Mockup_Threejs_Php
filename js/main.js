import * as THREE from "three";
import { gsap } from "gsap";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";
import { scene, camera, renderer, labelRenderer, orbitControls } from './scene.js';
import { setupLighting, directionalLight } from './lighting.js';
import { setupEnvironment } from './environment.js';
import { setupPostprocessing } from './postprocessing.js';
import { loadModel } from './loader.js';
import { setupUIControls, updateLightPosDisplay } from './ui_controls.js';
import { startAnimationLoop } from './animation.js';
import { setupInitialAnnotations, initAnnotationCreator, updateAnnotationsVisibility } from './annotation.js'; 
import { populateSceneTree } from './working_tree.js';

function displayModelStats(stats) {
    const verticesEl = document.getElementById('stats-vertices');
    const trianglesEl = document.getElementById('stats-triangles');

    if (verticesEl && trianglesEl) {
        verticesEl.textContent = stats.vertices.toLocaleString('id-ID');
        trianglesEl.textContent = stats.triangles.toLocaleString('id-ID');
    }
}

function calculateStats(model) {
    let totalVertices = 0;
    let totalTriangles = 0;
    model.traverse(function (child) {
        if (child.isMesh) {
            const geometry = child.geometry;
            totalVertices += geometry.attributes.position.count;
            if (geometry.index) {
                totalTriangles += geometry.index.count / 3;
            } else {
                totalTriangles += geometry.attributes.position.count / 3;
            }
        }
    });
    return {
        vertices: totalVertices,
        triangles: Math.floor(totalTriangles)
    };
}

document.body.appendChild(renderer.domElement);
document.body.appendChild(labelRenderer.domElement);

setupLighting(scene);
setupEnvironment(scene);

const { composer, outlinePass } = setupPostprocessing(renderer, scene, camera);

let mixer;
let currentModel; 
const userRole = window.userRole; 

loadModel(scene, (loadedModel, animations, modelMixer, stats) => {
    mixer = modelMixer;
    currentModel = loadedModel;
    
    setupUIControls(orbitControls, animations || [], mixer);
    setupInitialAnnotations(currentModel, camera, scene, orbitControls, userRole);
    populateSceneTree(currentModel, outlinePass, scene, userRole);
    displayModelStats(stats); 

    if (userRole === 'admin') {
        currentModel.traverse(child => {
            if (child.isMesh) {
                child.userData.originalGeometry = child.geometry.clone();
            }
        });
        initAnnotationCreator(currentModel, camera, scene, orbitControls, renderer, userRole);
    }
});

if (userRole === 'admin') {
    const simplifySlider = document.getElementById('simplify-slider');
    const simplifyValue = document.getElementById('simplify-value');
    const applyBtn = document.getElementById('apply-simplify-btn');
    const statusEl = document.getElementById('optimizer-status');

    if (simplifySlider) {
        simplifySlider.addEventListener('input', (event) => {
            const percentage = parseFloat(event.target.value) * 100;
            simplifyValue.textContent = `${percentage.toFixed(0)}%`;
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            if (!currentModel) {
                statusEl.textContent = "Model not loaded yet.";
                return;
            }

            const percentage = parseFloat(simplifySlider.value);    
            statusEl.textContent = "Processing...";
            applyBtn.disabled = true;
            
            setTimeout(() => {
                const startTime = performance.now();
                try {
                    const modifier = new SimplifyModifier();
                    let meshesProcessed = 0;
                    currentModel.traverse(child => {
                        if (child.isMesh) {
                            const originalGeometry = child.userData.originalGeometry || child.geometry;
                            
                            if (percentage === 1) {
                                child.geometry = originalGeometry.clone();
                            } else {
                                const clonedGeometry = originalGeometry.clone();
                                const originalVertexCount = clonedGeometry.attributes.position.count;
                                const targetVertexCount = Math.floor(originalVertexCount * (1 - percentage));
                                
                                if (targetVertexCount < originalVertexCount && targetVertexCount > 0) {
                                    const simplifiedGeometry = modifier.modify(clonedGeometry, targetVertexCount);
                                    child.geometry.dispose(); 
                                    child.geometry = simplifiedGeometry;
                                }
                            }
                            meshesProcessed++;
                        }
                    });
                    if (meshesProcessed === 0) {
                        throw new Error("No mesh found in the model.");
                    }
                    const endTime = performance.now();
                    const processTime = ((endTime - startTime) / 1000).toFixed(2);    
                    const newStats = calculateStats(currentModel);
                    displayModelStats(newStats);
                    statusEl.textContent = `Success! Processed in ${processTime}s.`;
                } catch (error) {
                    console.error("Simplification failed:", error);
                    statusEl.textContent = `Error: ${error.message}`;
                } finally {
                    applyBtn.disabled = false;
                }
            }, 50); 
        });
    }
    
    const flatShadingCheckbox = document.getElementById('flat-shading-checkbox');
    if (flatShadingCheckbox) {
        flatShadingCheckbox.addEventListener('change', (event) => {
            const enableFlatShading = event.target.checked;
            if (currentModel) {
                currentModel.traverse(child => {
                    if (child.isMesh) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                material.flatShading = enableFlatShading;
                                material.needsUpdate = true; 
                            });
                        } else if (child.material) {
                            child.material.flatShading = enableFlatShading;
                            child.material.needsUpdate = true;
                        }
                    }
                });
            }
        });
    }
}

const lightSliderX = document.getElementById("lightSliderX");
const lightValueX = document.getElementById("lightValueX");
const lightSliderY = document.getElementById("lightSliderY");
const lightValueY = document.getElementById("lightValueY");
const lightSliderZ = document.getElementById("lightSliderZ");
const lightValueZ = document.getElementById("lightValueZ");

if (lightSliderX) {
    lightSliderX.addEventListener('input', (event) => {
        directionalLight.position.x = parseFloat(event.target.value);
        lightValueX.textContent = event.target.value;
        updateLightPosDisplay(directionalLight.position);
    });
}
if (lightSliderY) {
    lightSliderY.addEventListener('input', (event) => {
        directionalLight.position.y = parseFloat(event.target.value);
        lightValueY.textContent = event.target.value;
        updateLightPosDisplay(directionalLight.position);
    });
}
if (lightSliderZ) {
    lightSliderZ.addEventListener('input', (event) => {
        directionalLight.position.z = parseFloat(event.target.value);
        lightValueZ.textContent = event.target.value;
        updateLightPosDisplay(directionalLight.position);
    });
}
updateLightPosDisplay(directionalLight.position);

const toolbar = document.querySelector('.viewer-toolbar');
if (toolbar) {
    toolbar.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const targetId = button.dataset.target;
        if (!targetId) return;

        const targetPanel = document.getElementById(targetId);
        if (!targetPanel) return;
        
        const isAlreadyVisible = targetPanel.classList.contains('visible');

        if (targetId === 'working-tree' && isAlreadyVisible) {
            outlinePass.selectedObjects = [];

            const treeContainer = document.getElementById("scene-tree");
            if (treeContainer) {
                treeContainer.querySelectorAll("li.selected").forEach((li) => {
                    li.classList.remove("selected");
                });
            }
        }

        document.querySelectorAll('.viewer-panel.visible').forEach(panel => {
            panel.classList.remove('visible');
        });
        toolbar.querySelectorAll('button.active').forEach(btn => {
            btn.classList.remove('active');
        });

        if (!isAlreadyVisible) {
            targetPanel.classList.add('visible');
            button.classList.add('active');
        }
    });
}

startAnimationLoop(renderer, scene, camera, composer, labelRenderer, orbitControls, () => mixer, updateAnnotationsVisibility);
console.log("All modules loaded.");