let animationActions = [];
let mixer;
let orbitControlsRef; 

function setupUIControls(controls, anims, mix) {
    orbitControlsRef = controls;
    animationActions = anims.map(clip => mix.clipAction(clip));
    mixer = mix;

    const rotateBtn = document.getElementById("toggleRotateBtn");
    const playAnimationButton = document.getElementById("playAnimationBtn");
    const stopAnimationButton = document.getElementById("stopAnimationBtn");

    const lightPosDisplay = document.getElementById("lightPosDisplay");
    const lightSliderX = document.getElementById("lightSliderX");
    const lightValueX = document.getElementById("lightValueX");
    const lightSliderY = document.getElementById("lightSliderY");
    const lightValueY = document.getElementById("lightValueY");
    const lightSliderZ = document.getElementById("lightSliderZ");
    const lightValueZ = document.getElementById("lightValueZ");
    

    if (rotateBtn) {
      rotateBtn.addEventListener("click", toggleRotation);
    }
    if (playAnimationButton) {
        playAnimationButton.addEventListener("click", playAllAnimations);
    }
    if (stopAnimationButton) {
        stopAnimationButton.addEventListener("click", stopAllAnimations);
    }

    if (lightSliderX && lightValueX) {
        lightValueX.textContent = lightSliderX.value;
        lightSliderX.addEventListener("input", (event) => {
        });
    }
    if (lightSliderY && lightValueY) {
        lightValueY.textContent = lightSliderY.value;
        lightSliderY.addEventListener("input", (event) => {
        });
    }
    if (lightSliderZ && lightValueZ) {
        lightValueZ.textContent = lightSliderZ.value;
        lightSliderZ.addEventListener("input", (event) => {
        });
    }
    
    updateLightPosDisplay();
}

function toggleRotation() {
    if (orbitControlsRef) {
        orbitControlsRef.autoRotate = !orbitControlsRef.autoRotate;
    }
}

function playAllAnimations() {
    if (mixer && animationActions.length > 0) {
        animationActions.forEach((action) => {
            if (!action.isRunning()) {
                action.reset().play();
            }
        });
    }
}

function stopAllAnimations() {
    if (mixer && animationActions.length > 0) {
        animationActions.forEach((action) => {
            action.stop();
        });
    }
}

function updateLightPosDisplay(position) {
    const lightPosDisplay = document.getElementById("lightPosDisplay");
    if (lightPosDisplay && position) {
        lightPosDisplay.textContent = `(${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`;
    }
}

export { setupUIControls, updateLightPosDisplay };