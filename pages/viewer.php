<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Project 1</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="viewer">
    <div class="back-button">
        <button onclick="location.href = 'catalog.php'">Back</button>
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

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/"
        }
    }
    </script>

    <script type="module" src="../js/main.js"></script>
</body>
</html>