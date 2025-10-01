<?php
session_start();
require_once __DIR__ . '/../config/sqlite_db.php';
$models = [];
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

try {
    $sql = "SELECT id, model_id, model_name, thumbnail_path, model_desc
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
<html lang="en">
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>
</head>
<body class="catalog">
    <div id="vanta-bg-catalog"></div>

    <header class="catalog-header">
        <div class="header-left">
            <a href="logout.php" class="header-btn" title="Logout">
                <span class="btn-text">&larr;</span>
            </a>
        </div>
        <h1 class="catalog-title">M O D E L</h1>
        <div class="header-right">
            <?php if ($is_admin): ?>
                <button type="button" id="addModelBtn" class="header-btn" title="Add New Model">
                    <span class="btn-text">+</span>
                </button>
            <?php endif; ?>
        </div>
    </header>

    <div class="catalog-container">
        <?php if (empty($models)): ?>
            <p class="empty-message">No models found. Please add a new model.</p>
        <?php else: ?>
            <?php foreach ($models as $model): ?>
                <div class="model-card">
                    <a href="viewer.php?model=<?php echo htmlspecialchars($model['model_id']); ?>" class="card-inner-content">
                        <img src="<?php echo htmlspecialchars(empty($model['thumbnail_path']) ? '../assets/thumbnails/placeholder.png' : $model['thumbnail_path']); ?>" alt="<?php echo htmlspecialchars($model['model_name']); ?>">
                        <h3><?php echo htmlspecialchars($model['model_name']); ?></h3>
                    </a>
                    <?php if ($is_admin): ?>
                        <div class="model-actions">
                            <button
                                class="action-btn edit-btn"
                                data-model-id="<?php echo htmlspecialchars($model['model_id']); ?>"
                                data-model-name="<?php echo htmlspecialchars($model['model_name']); ?>"
                                data-model-desc="<?php echo htmlspecialchars($model['model_desc']); ?>">
                                ✎
                            </button>
                            <a href="delete_model.php?model_id=<?php echo htmlspecialchars($model['model_id']); ?>" class="action-btn delete-btn" onclick="return confirm('Are you sure you want to delete this model? All associated annotations will also be deleted.');">
                                🗑
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div id="modelModal" class="modal-overlay" style="display: none;">
        <div class="modal-content form-container">
            <button type="button" class="modal-close-btn" id="closeModalBtn">&times;</button>
            <h1 id="modalTitle">New Model</h1>
            <div id="modalErrorMessage" style="color:red; margin-bottom: 15px;"></div>
            <div id="thumbnailGenerationStatus" style="margin-bottom: 15px; color: var(--primary-color-100);"></div>

            <form id="modelForm" action="save_model.php" method="POST">
                <input type="hidden" id="formType" name="form_type" value="add">
                <input type="hidden" id="originalModelId" name="original_model_id">
                <input type="hidden" id="generated_thumbnail_data" name="generated_thumbnail_data">

                <div class="form-group">
                    <label for="model_name">Model Name  :</label>
                    <input type="text" id="model_name" name="model_name" required>
                </div>
                <div class="form-group">
                    <label for="model_id">Model ID (File .glb name without extension) :</label>
                    <input type="text" id="model_id" name="model_id" required>
                </div>
                <div class="form-group">
                    <label for="model_desc">Model Description  :</label>
                    <textarea id="model_desc" name="model_desc"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" id="submitBtn">Save</button>
                </div>
            </form>
        </div>
    </div>

    <script type="module">
        import { generateThumbnails } from '../js/thumbnail_generator.js';

        VANTA.NET({
            el: "#vanta-bg-catalog",
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x04445f,
            backgroundColor: 0x222222,
            points: 10.00,
            maxDistance: 15.00,
            spacing: 12.00
        });

        const modalOverlay = document.getElementById('modelModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const addModelBtn = document.getElementById('addModelBtn');
        const editBtns = document.querySelectorAll('.edit-btn');
        const modelForm = document.getElementById('modelForm');
        const modalTitle = document.getElementById('modalTitle');
        const modelNameInput = document.getElementById('model_name');
        const modelIdInput = document.getElementById('model_id');
        const modelDescInput = document.getElementById('model_desc');
        const originalModelIdInput = document.getElementById('originalModelId');
        const formTypeInput = document.getElementById('formType');
        const submitBtn = document.getElementById('submitBtn');
        const modalErrorMessage = document.getElementById('modalErrorMessage');
        const thumbnailGenerationStatus = document.getElementById('thumbnailGenerationStatus');
        const generatedThumbnailInput = document.getElementById('generated_thumbnail_data');

        function openModal(mode, data = {}) {
            modalErrorMessage.textContent = '';
            thumbnailGenerationStatus.textContent = '';
            modelForm.reset();

            if (mode === 'add') {
                modalTitle.textContent = 'New Model';
                modelForm.action = 'save_model.php';
                formTypeInput.value = 'add';
                modelIdInput.readOnly = false;
                submitBtn.textContent = 'Save';
            } else if (mode === 'edit') {
                modalTitle.textContent = 'Edit Model';
                modelForm.action = 'update_model.php';
                formTypeInput.value = 'edit';
                modelIdInput.readOnly = true; 
                submitBtn.textContent = 'Update';

                modelNameInput.value = data.name || '';
                modelIdInput.value = data.id || '';
                modelDescInput.value = data.desc || '';
                originalModelIdInput.value = data.id || '';
            }
            modalOverlay.style.display = 'flex';
        }

        function closeModal() {
            modalOverlay.style.display = 'none';
        }

        if (addModelBtn) {
            addModelBtn.addEventListener('click', () => openModal('add'));
        }

        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modelData = {
                    id: btn.dataset.modelId,
                    name: btn.dataset.modelName,
                    desc: btn.dataset.modelDesc
                };
                openModal('edit', modelData);
            });
        });

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });

        modelForm.addEventListener('submit', async function(event) {
            if (formTypeInput.value === 'add') {
                event.preventDefault();
                submitBtn.disabled = true;
                submitBtn.textContent = 'Generating Thumbnail...';
                thumbnailGenerationStatus.textContent = 'Please wait, on progress making thumbnail...';
                modalErrorMessage.textContent = '';

                const modelId = modelIdInput.value.trim();
                if (!modelId) {
                    modalErrorMessage.textContent = 'Model ID cannot be empty.';
                    thumbnailGenerationStatus.textContent = '';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save';
                    return;
                }

                const modelPath = `../assets/model/${modelId}.glb`;
                try {
                    const dataUrl = await generateThumbnails(modelPath, 300, 200);
                    generatedThumbnailInput.value = dataUrl;
                    thumbnailGenerationStatus.textContent = 'Thumbnail created successfully!';
                    event.target.submit();
                } catch (error) {
                    console.error("Error while making thumbnail or submit:", error);
                    let errorMessage = error.message;
                    modalErrorMessage.textContent = `Failed to process the model: ${errorMessage}`;
                    thumbnailGenerationStatus.textContent = 'Failed to make thumbnail.';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save';
                }
            }
        });
    </script>
</body>
</html>