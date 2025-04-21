<!-- <?php
$models = [
    [
        'id' => 'Microhydro System 2', 
        'name' => 'Microhydro System 2',
        'thumbnail' => '../assets/thumbnails/Micro_2.png' 
    ],
    [
        'id' => 'Microhydro_System', 
        'name' => 'Microhydro System',
        'thumbnail' => '../assets/thumbnails/Micro.png' 
    ],
    [
        'id' => 'MSD700_ブレードモデル_MCLA15A',
        'name' => 'MSD700',
        'thumbnail' => '../assets/thumbnails/MSD700.png'
    ],
];
?> -->

<?php
require_once __DIR__ . '/../config/sqlite_db.php'; // change to 'mysql_db.php' if already using MySQL
$models = []; 

try {
    $sql = "SELECT model_id AS id, model_name AS name, thumbnail_path AS thumbnail
            FROM model
            WHERE model_id IS NOT NULL 
            ORDER BY model_name";

    $stmt = $pdo->query($sql);
    $models = $stmt->fetchAll();
} catch (\PDOException $e) {
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    $models = [];
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Project 1</title>
    <link rel="stylesheet" href="../css/style.css"> 
</head>
<body class="catalog">
    <h1 class="catalog-title">M O D E L</h1>

    <div>
        <button type="button" id="addModelBtn" class="add-model-button">+</button>
    </div>
    
    <div class="catalog-container">
        <?php if (empty($models)): ?>
        <?php else: ?>
            <?php foreach ($models as $model): ?>
                <a href="viewer.php?model=<?php echo htmlspecialchars($model['id']); ?>" class="model-card">
                    <img src="<?php echo htmlspecialchars($model['thumbnail']); ?>" alt="<?php echo htmlspecialchars($model['name']); ?>">
                    <h3><?php echo htmlspecialchars($model['name']); ?></h3>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div id="addModelModal" class="modal-overlay" style="display: none;"> <div class="modal-content form-container"> <button type="button" class="modal-close-btn" id="closeModalBtn">&times;</button> <h1>New Model</h1>
        <div id="modalErrorMessage" style="color:red; margin-bottom: 15px;"></div>
        <form id="addModelForm" action="save_model.php" method="POST">
            <div class="form-group">
                <label for="model_name">Model Name  :</label>
                <input type="text" id="model_name" name="model_name" required>
            </div>
            <div class="form-group">
                <label for="model_id">Model ID  :</label>
                <input type="text" id="model_id" name="model_id" required>
            </div>
            <div class="form-group">
                <label for="thumbnail_path">Path Thumbnail  :</label>
                <input type="text" id="thumbnail_path" name="thumbnail_path">
            </div>
            <div class="form-group">
                <label for="model_desc">Model Description  :</label>
                <textarea id="model_desc" name="model_desc"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit">Save</button>
            </div>
        </form>
    </div>

    <script>
        const addModelButton = document.getElementById('addModelBtn');
        const modalOverlay = document.getElementById('addModelModal');
        const closeModalButton = document.getElementById('closeModalBtn');
        const addModelForm = document.getElementById('addModelForm'); 
        const modalErrorMessage = document.getElementById('modalErrorMessage'); 

        function openModal() {
            modalErrorMessage.textContent = ''; 
            addModelForm.reset(); 
            if (modalOverlay) {
                modalOverlay.style.display = 'flex'; 
            }
        }

        function closeModal() {
            if (modalOverlay) {
                modalOverlay.style.display = 'none'; 
            }
        }

        if (addModelButton) {
            addModelButton.addEventListener('click', openModal);
        }
        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(event) {
                if (event.target === modalOverlay) {
                    closeModal();
                }
            });
        }
    </script>
</body>
</html>