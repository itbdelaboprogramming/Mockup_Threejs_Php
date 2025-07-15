<?php
require_once __DIR__ . '/../config/sqlite_db.php'; // Ganti ke mysql_db.php jika menggunakan MySQL
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
    <title>Learning Project 1 - Catalog</title>
    <link rel="stylesheet" href="../css/style.css">
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/"
        }
    }
    </script>
    </head>
<body class="catalog">
    <h1 class="catalog-title">M O D E L</h1>

    <div>
        <button type="button" id="addModelBtn" class="add-model-button">+</button>
    </div>

    <div class="catalog-container">
        <?php if (empty($models)): ?>
            <p style="color: white; text-align: center; grid-column: 1 / -1;">No models found.</p>
        <?php else: ?>
            <?php foreach ($models as $model): ?>
                <a href="viewer.php?model=<?php echo htmlspecialchars($model['id']); ?>" class="model-card">
                    <img src="<?php echo htmlspecialchars(empty($model['thumbnail']) ? '../assets/thumbnails/placeholder.png' : $model['thumbnail']); ?>" alt="<?php echo htmlspecialchars($model['name']); ?>">
                    <h3><?php echo htmlspecialchars($model['name']); ?></h3>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div id="addModelModal" class="modal-overlay" style="display: none;">
        <div class="modal-content form-container">
            <button type="button" class="modal-close-btn" id="closeModalBtn">&times;</button>
            <h1>New Model</h1>
            <div id="modalErrorMessage" style="color:red; margin-bottom: 15px;"></div>
            <div id="thumbnailGenerationStatus" style="margin-bottom: 15px; color: var(--primary-color-100);"></div>

            <form id="addModelForm" action="save_model.php" method="POST">
                <div class="form-group">
                    <label for="model_name">Model Name  :</label>
                    <input type="text" id="model_name" name="model_name" required>
                </div>
                <div class="form-group">
                    <label for="model_id">Model ID (File .glb name without extension) :</label>
                    <input type="text" id="model_id" name="model_id" required>
                </div>
                <input type="hidden" id="generated_thumbnail_data" name="generated_thumbnail_data">

                <div class="form-group">
                    <label for="model_desc">Model Description  :</label>
                    <textarea id="model_desc" name="model_desc"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" id="saveModelSubmitBtn">Save</button>
                </div>
            </form>
        </div>
    </div>

    <script type="module"> 
        import { generateThumbnails } from '../js/thumbnail_generator.js'; 

        const addModelButton = document.getElementById('addModelBtn');
        const modalOverlay = document.getElementById('addModelModal');
        const closeModalButton = document.getElementById('closeModalBtn');
        const addModelForm = document.getElementById('addModelForm');
        const modalErrorMessage = document.getElementById('modalErrorMessage');
        const thumbnailGenerationStatus = document.getElementById('thumbnailGenerationStatus');
        const saveModelSubmitBtn = document.getElementById('saveModelSubmitBtn');

        function openModal() {
            modalErrorMessage.textContent = '';
            thumbnailGenerationStatus.textContent = '';
            addModelForm.reset();
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
            }
            saveModelSubmitBtn.disabled = false;
            saveModelSubmitBtn.textContent = 'Save';
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

        if (addModelForm) {
            addModelForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                saveModelSubmitBtn.disabled = true;
                saveModelSubmitBtn.textContent = 'Generating Thumbnail...';
                thumbnailGenerationStatus.textContent = 'Mohon tunggu, thumbnail sedang dibuat...';
                modalErrorMessage.textContent = '';

                const modelIdInput = document.getElementById('model_id');
                const modelId = modelIdInput.value.trim();

                if (!modelId) {
                    modalErrorMessage.textContent = 'Model ID tidak boleh kosong.';
                    thumbnailGenerationStatus.textContent = '';
                    saveModelSubmitBtn.disabled = false;
                    saveModelSubmitBtn.textContent = 'Save';
                    return;
                }

                const modelPath = `../assets/model/${modelId}.glb`;
                const hiddenThumbnailInput = document.getElementById('generated_thumbnail_data');

                try {
                    console.log(`Mencoba membuat thumbnail untuk: ${modelPath} menggunakan fungsi yang diimpor.`);
                    const dataUrl = await generateThumbnails(modelPath, 300, 200); 
                    hiddenThumbnailInput.value = dataUrl;
                    thumbnailGenerationStatus.textContent = 'Thumbnail berhasil dibuat!';
                    console.log("Thumbnail data URL siap dikirim.");

                    event.target.submit();

                } catch (error) {
                    console.error("Error saat membuat thumbnail atau submit:", error);
                    let errorMessage = "Terjadi kesalahan.";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    } else if (typeof error === 'string') {
                        errorMessage = error;
                    }
                    modalErrorMessage.textContent = `Gagal memproses model: ${errorMessage}`;
                    thumbnailGenerationStatus.textContent = 'Pembuatan thumbnail gagal.';
                    saveModelSubmitBtn.disabled = false;
                    saveModelSubmitBtn.textContent = 'Save';
                }
            });
        }
    </script>
</body>
</html>