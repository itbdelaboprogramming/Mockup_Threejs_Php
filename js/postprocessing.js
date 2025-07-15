import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

function setupPostprocessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
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
    
    window.addEventListener('resize', () => {
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { composer, outlinePass };
}

export { setupPostprocessing };