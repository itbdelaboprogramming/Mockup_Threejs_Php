import * as THREE from 'three';

let clock = new THREE.Clock();

function startAnimationLoop(renderer, scene, camera, composer, labelRenderer, orbitControls, getMixer) {
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        const currentMixer = getMixer();

        if (currentMixer) {
            currentMixer.update(delta);
        }

        orbitControls.update();
        composer.render();
        labelRenderer.render(scene, camera);
    }
    animate();
}

export { startAnimationLoop };