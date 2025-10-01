<?php
session_start();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Project 1</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="viewer">
    <div id="label-container"></div>
    <div class="back-button">
        <button onclick="location.href = 'catalog.php'">&larr;</button>
    </div>
    
    <div class="viewer-toolbar">
        <button data-target="light-controls" title="Light Controls" data-tooltip="Light Controls">💡</button>
        <button data-target="working-tree" title="Working Tree" data-tooltip="Working Tree">🌳</button>
        <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
            <button data-target="annotation-creator" title="Add Annotation" data-tooltip="Add Annotation">✏️</button>
            <button data-target="stats-panel" title="Model Stats" data-tooltip="Model Stats">📊</button>
            <button data-target="optimizer-panel" title="Optimizer" data-tooltip="Optimizer">⚙️</button>
            <button data-target="rendering-panel" title="Rendering" data-tooltip="Rendering">🎨</button>
        <?php endif; ?>
    </div>

    <div class="animation-controls">
        <button id="playPauseBtn" title="Play/Pause">▶</button>
        <button id="stopAnimationBtn" title="Stop">■</button>
    </div>
    <div class="rotate-button">
        <button id="toggleRotateBtn">Rotate</button>
    </div>

    <div id="light-controls" class="light-controls viewer-panel glass-panel">
        <h2 class="panel-title">Light Control</h2>
        <div class="panel-content">
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
        </div>
    </div>

    <div id="working-tree" class="working-tree viewer-panel glass-panel">
        <h2 class="panel-title">Working Tree</h2>
        <div class="panel-content">
            <ul id="scene-tree"></ul>
        </div>
    </div>

    <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
    <div id="stats-panel" class="stats-panel viewer-panel glass-panel">
        <h2 class="panel-title">Model Stats</h2>
        <div id="model-stats-content" class="panel-content">
            <div class="stat-item">
                <span class="stat-label">Vertices:</span> 
                <span class="stat-value" id="stats-vertices">loading...</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Triangles:</span> 
                <span class="stat-value" id="stats-triangles">loading...</span>
            </div>
        </div>
    </div>

    <div id="optimizer-panel" class="optimizer-panel viewer-panel glass-panel">
        <h2 class="panel-title">Optimizer</h2>
        <div class="panel-content">
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
    </div>

    <div id="rendering-panel" class="rendering-panel viewer-panel glass-panel">
        <h2 class="panel-title">Rendering</h2>
        <div class="panel-content">
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="flat-shading-checkbox">
                    <span>Enable Flat Shading</span>
                </label>
            </div>
        </div>
    </div>

    <div id="annotation-creator" class="annotation-creator viewer-panel glass-panel">
        <h3 class="panel-title">Add Annotation</h3>
        <div class="panel-content">
            <button id="placementModeBtn">
                Click to Place Annotation
            </button>
            <div class="form-group">
                <label for="anno_text">Label Text:</label>
                <input type="text" id="anno_text" name="anno_text">
            </div>
            <button id="addAnnotationBtn">Add</button>
            <p id="annotation-feedback"></p>
        </div>
    </div>
    <?php endif; ?>

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/",
            "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js"
        }
    }
    </script>
    <script>
        window.userRole = "<?php echo isset($_SESSION['role']) ? $_SESSION['role'] : 'guest'; ?>";
    </script>

    <script type="module" src="../js/main.js"></script>
</body>
</html>