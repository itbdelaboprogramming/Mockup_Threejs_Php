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

            let totalVertices = 0;
            let totalTriangles = 0;
            load3D.traverse(function (child) {
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

            const stats = {
                vertices: totalVertices,
                triangles: Math.floor(totalTriangles) 
            };

            const ringGeometry = new THREE.RingGeometry(
                1.2,  // innerRadius
                1.3,  // outerRadius
                100    // thetaSegments
            );
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff, 
                transparent: true,
            });
            const pulsingRing = new THREE.Mesh(ringGeometry, ringMaterial);

            pulsingRing.rotation.x = -Math.PI / 2;
            pulsingRing.position.y = -0.9;

            scene.add(pulsingRing);
            window.pulsingRing = pulsingRing; 
            
            if (onModelLoaded) {
                onModelLoaded(load3D, gltf.animations, mixer, stats);
            }
        },
        undefined, 
        function (error) {
            console.error("Error loading model:", error);
        }
    );
}

export { loadModel };