import * as THREE from "three";
import { gsap } from "gsap";

import { scene, camera, renderer, labelRenderer, orbitControls } from './scene.js';
import { setupLighting, directionalLight } from './lighting.js';
import { setupEnvironment } from './environment.js';
import { setupPostprocessing } from './postprocessing.js';
import { loadModel } from './loader.js';
import { setupUIControls, updateLightPosDisplay } from './ui_controls.js';
import { startAnimationLoop } from './animation.js';
import { setupInitialAnnotations, initAnnotationCreator } from './annotation.js'; 
import { populateSceneTree } from './working_tree.js'; 

document.body.appendChild(renderer.domElement);
document.body.appendChild(labelRenderer.domElement);

setupLighting(scene);
setupEnvironment(scene);

const { composer, outlinePass } = setupPostprocessing(renderer, scene, camera);

let mixer;
loadModel(scene, (loadedModel, animations, modelMixer) => {
    mixer = modelMixer;
    
    setupUIControls(orbitControls, animations || [], mixer);

    setupInitialAnnotations(loadedModel, camera, scene, orbitControls);

    initAnnotationCreator(loadedModel, camera, scene, orbitControls);
    
    populateSceneTree(loadedModel, outlinePass, scene);
});

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

startAnimationLoop(renderer, scene, camera, composer, labelRenderer, orbitControls, () => mixer);

console.log("All modules loaded.");