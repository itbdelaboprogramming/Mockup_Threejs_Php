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
    <div class="animation-controls">
        <button id="playAnimationBtn">Play</button>
        <button id="stopAnimationBtn">Stop</button>
    </div>
    <div class="rotate-button">
        <button id="toggleRotateBtn">Rotate</button>
    </div>
    <div class="light-controls">
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

    <div class="working-tree">
        <h2>Working Tree</h2>
        <ul id="scene-tree"></ul>
        
    </div>

    <div class="annotation-creator" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
        <h3 style="margin-top:0; margin-bottom: 10px; font-size: 18px;">Add Annotation (Testing)</h3>
        <div class="form-group" style="margin-bottom: 10px;">
            <label for="anno_text" style="font-weight:normal;">Label Text:</label>
            <input type="text" id="anno_text" name="anno_text" style="width: 95%; padding: 5px;">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label style="font-weight:normal;">Target Point (X, Y, Z):</label>
            <div style="display: flex; gap: 5px;">
                <input type="number" id="anno_x" step="0.1" placeholder="X" style="width: 30%; padding: 5px;">
                <input type="number" id="anno_y" step="0.1" placeholder="Y" style="width: 30%; padding: 5px;">
                <input type="number" id="anno_z" step="0.1" placeholder="Z" style="width: 30%; padding: 5px;">
            </div>
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