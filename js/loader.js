import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import * as THREE from "three";

function loadModel(scene, onModelLoaded) {
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get("model");
    
    if (!modelId) {
        console.error("Model ID not found in URL");
        return;
    }

    const modelPath = `../assets/model/${modelId}.glb`;
    console.log(`Load model: ${modelPath}`);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
        modelPath,
        function (gltf) {
            const load3D = gltf.scene;
            load3D.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            scene.add(load3D);
            load3D.position.set(0, -0.9, 0);

            let mixer = null;
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(load3D);
            }
            
            if (onModelLoaded) {
                onModelLoaded(load3D, gltf.animations, mixer);
            }
        },
        undefined, 
        function (error) {
            console.error("Error loading model:", error);
        }
    );
}

export { loadModel };