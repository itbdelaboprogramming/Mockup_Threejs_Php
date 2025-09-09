<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Project 1</title>
    <link rel="stylesheet" href="../css/style.css">
    <!-- <link rel="stylesheet" href="../css/global.css"> -->
    <!-- <link rel="stylesheet" href="../css/viewer.css"> -->
</head>
<body class="viewer">
    <div id="label-container"></div>
    <div class="back-button">
        <button onclick="location.href = 'catalog.php'">Back</button>
    </div>

    <div class="viewer-toolbar">
        <button data-target="light-controls" title="Light Controls">💡</button>
        <button data-target="working-tree" title="Working Tree">🌳</button>
        <button data-target="annotation-creator" title="Add Annotation">✏️</button>
        <button data-target="stats-panel" title="Model Stats">📊</button>
        <button data-target="optimizer-panel" title="Optimizer">⚙️</button>
        <button data-target="rendering-panel" title="Rendering">🎨</button>
    </div>

    <div class="animation-controls">
        <button id="playPauseBtn" title="Play/Pause">▶</button>
        <button id="stopAnimationBtn" title="Stop">■</button>
    </div>
    <div class="rotate-button">
        <button id="toggleRotateBtn">Rotate</button>
    </div>
    <div id="light-controls" class="light-controls viewer-panel">
        <fieldset>
            <legend>Light Control</legend>
            <div>
                <label for="lightSliderX">X :</label>
                <input type="range" id="lightSliderX" name="lightSliderX" min="-25" max="25" value="-4" step="1">
                <span class="slider-value" id="lightValueX">-4</span>
            </div>
            
            <div>
                <label for="lightSliderY">Y :</label>
                <input type="range" id="lightSliderY" name="lightSliderY" min="1" max="30" value="15" step="1">
                <span class="slider-value" id="lightValueY">15</span>
            </div>
            
            <div>
                <label for="lightSliderZ">Z :</label>
                <input type="range" id="lightSliderZ" name="lightSliderZ" min="-20" max="20" value="12" step="1">
                <span class="slider-value" id="lightValueZ">12</span>
            </div>
            
            <div>Position : <span id="lightPosDisplay">(x, y, z)</span></div>
        </fieldset>
    </div>

    <div id="working-tree" class="working-tree viewer-panel">
        <h2>Working Tree</h2>
        <ul id="scene-tree"></ul>
        
    </div>

    <div id="stats-panel" class="stats-panel viewer-panel">
        <h2>Model Stats</h2>
        <div id="model-stats-content">
            <p>Vertices: <span id="stats-vertices">loading...</span></p>
            <p>Triangles: <span id="stats-triangles">loading...</span></p>
        </div>
    </div>

    <div id="optimizer-panel" class="optimizer-panel viewer-panel">
        <h2>Optimizer</h2>
        <div class="form-group">
            <label for="simplify-slider">Simplification:</label>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="range" id="simplify-slider" min="0" max="1" value="1" step="0.01">
                <span id="simplify-value">100%</span>
            </div>
        </div>
        <button id="apply-simplify-btn">Apply</button>
        <p id="optimizer-status"></p>
    </div>

    <div id="rendering-panel" class="rendering-panel viewer-panel">
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="flat-shading-checkbox">
                <span>Enable Flat Shading</span>
            </label>
        </div>
    </div>

    <div id="annotation-creator" class="annotation-creator viewer-panel">
        <h3 style="margin-top:0; margin-bottom: 10px; font-size: 18px;">Add Annotation</h3>
        <button id="placementModeBtn" style="width:100%; padding: 8px 15px; margin-bottom:10px; border:1px solid #74e7d4; background-color: transparent; border-radius: 5px; cursor: pointer; color: #04445f; font-weight: bold;">
            Click to Place Annotation
        </button>
        <div class="form-group" style="margin-bottom: 10px;">
            <label for="anno_text" style="font-weight:normal;">Label Text:</label>
            <input type="text" id="anno_text" name="anno_text" style="width: 95%; padding: 5px;">
        </div>
        
        <button id="addAnnotationBtn" style="padding: 8px 15px; background-color: #74e7d4; border: none; border-radius: 5px; cursor: pointer; color: #04445f; font-weight: bold;">Add</button>
        <p id="annotation-feedback" style="margin-top: 10px; color: #ff7582;"></p>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/",
            "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js"
        }
    }
    </script>

    <script type="module" src="../js/main.js"></script>
</body>
</html>