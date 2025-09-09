let animationActions = [];
let mixer;
let orbitControlsRef; 
let isPlaying = false;

function setupUIControls(controls, anims, mix) {
    orbitControlsRef = controls;
    animationActions = anims.map(clip => mix.clipAction(clip));
    mixer = mix;

    const rotateBtn = document.getElementById("toggleRotateBtn");
    const playPauseButton = document.getElementById("playPauseBtn");
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
    if (playPauseButton) {
        playPauseButton.addEventListener("click", togglePlayPause);
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
        const rotateBtn = document.getElementById("toggleRotateBtn");
        if (rotateBtn) {
            rotateBtn.classList.toggle('active', orbitControlsRef.autoRotate);
        }
    }
}

function togglePlayPause() {
    if (!mixer || animationActions.length === 0) return;

    const playPauseBtn = document.getElementById('playPauseBtn');

    if (isPlaying) {
        animationActions.forEach(action => action.paused = true);
        playPauseBtn.textContent = '▶';
    } else {
        animationActions.forEach(action => {
            if (action.paused) {
                action.paused = false; 
            } else {
                action.reset().play(); 
            }
        });
        playPauseBtn.textContent = '❚❚';
    }
    isPlaying = !isPlaying;
}

function stopAllAnimations() {
    if (!mixer || animationActions.length === 0) return;

    animationActions.forEach(action => action.stop());
    isPlaying = false;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.textContent = '▶';
}

function updateLightPosDisplay(position) {
    const lightPosDisplay = document.getElementById("lightPosDisplay");
    if (lightPosDisplay && position) {
        lightPosDisplay.textContent = `(${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`;
    }
}

export { setupUIControls, updateLightPosDisplay };