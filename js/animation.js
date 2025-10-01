import * as THREE from 'three';

let clock = new THREE.Clock();

function startAnimationLoop(renderer, scene, camera, composer, labelRenderer, orbitControls, getMixer, updateAnnotationsVisibility) {
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        const currentMixer = getMixer();

        if (currentMixer) {
            currentMixer.update(delta);
        }

        orbitControls.update();

        if (updateAnnotationsVisibility) {
            updateAnnotationsVisibility(camera);
        }

        if (window.pulsingRing) {
            const MAX_DISTANCE = 100; 
            const distance = camera.position.distanceTo(new THREE.Vector3(0, -0.9, 0)); 

            if (distance > MAX_DISTANCE) {
                window.pulsingRing.visible = false; 
            } else {
                window.pulsingRing.visible = true; 
            }

            const DURATION = 1; 
            const MIN_SCALE = 0.5;
            const MAX_SCALE = 1.7;
            const progress = (clock.getElapsedTime() % DURATION) / DURATION;
            const easedProgress = Math.sin(progress * Math.PI / 2);
            const scale = MIN_SCALE + easedProgress * (MAX_SCALE - MIN_SCALE);
            window.pulsingRing.scale.set(scale, scale, scale);

            if (progress < 0.5) {
                window.pulsingRing.material.opacity = 2*progress; 
            } else {
                window.pulsingRing.material.opacity = 2*(1 - progress); 
            }

        }

        composer.render();
        labelRenderer.render(scene, camera);
    }
    animate();
}

export { startAnimationLoop };