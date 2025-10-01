import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export async function generateThumbnails(modelPath, width = 300, height = 200) {
  return new Promise((resolve, reject) => {
    const thumbScene = new THREE.Scene();
    thumbScene.background = new THREE.Color(0xffffff);

    const thumbCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    thumbCamera.position.set(-7, 4, 5);
    thumbCamera.lookAt(new THREE.Vector3(0, 0, 0));

    const thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    thumbRenderer.setSize(width, height);
    thumbRenderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const ambientLightThumb = new THREE.AmbientLight(0xffffff, 0.8);
    thumbScene.add(ambientLightThumb);
    const directionalLightThumb = new THREE.DirectionalLight(0xffffff, 1);
    directionalLightThumb.position.set(5, 10, 7.5);
    thumbScene.add(directionalLightThumb);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelPath,
      function (gltf) {
        const model = gltf.scene;
        thumbScene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        thumbCamera.lookAt(center);

        try {
          thumbRenderer.render(thumbScene, thumbCamera);
          const dataURL = thumbRenderer.domElement.toDataURL("image/png");
          resolve(dataURL);
        } catch (e) {
          console.error("Error while rendering thumbnail:", e);
          reject("Error rendering thumbnail: " + e.message);
        } finally {
          thumbRenderer.dispose();
          model.traverse((child) => {
            if (child.isMesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => mat.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
          thumbScene.remove(model);
          thumbScene.remove(ambientLightThumb);
          thumbScene.remove(directionalLightThumb);
        }
      },
      undefined,
      function (error) {
        console.error(`Error loading model for thumbnail (${modelPath}):`, error);
        reject("Error loading model: " + error.message);
        thumbRenderer.dispose();
      }
    );
  });
}
