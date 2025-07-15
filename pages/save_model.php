<?php
define('GENERATED_THUMBNAILS_DIR', __DIR__ . '/../assets/thumbnails/generated/');
define('GENERATED_THUMBNAILS_URL_PATH', '../assets/thumbnails/generated/'); 

require_once __DIR__ . '/../config/sqlite_db.php'; // atau sqlite_db.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $model_name = trim($_POST['model_name'] ?? '');
    $model_id = trim($_POST['model_id'] ?? '');
    $model_desc = trim($_POST['model_desc'] ?? null);
    $generated_thumbnail_data = $_POST['generated_thumbnail_data'] ?? null; 

    $thumbnail_db_path = null;  

    if (empty($model_name) || empty($model_id)) {
        header("Location: catalog.php?error=emptyfields");
        exit;
    }

    if (!empty($generated_thumbnail_data)) {
        if (!is_dir(GENERATED_THUMBNAILS_DIR)) {
            if (!mkdir(GENERATED_THUMBNAILS_DIR, 0775, true)) { 
                header("Location: catalog.php?error=dircreationfailed");
                exit;
            }
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $generated_thumbnail_data, $type)) {
            $image_data = substr($generated_thumbnail_data, strpos($generated_thumbnail_data, ',') + 1);
            $image_type = strtolower($type[1]); 

            if (!in_array($image_type, ['jpg', 'jpeg', 'gif', 'png'])) {
                header("Location: catalog.php?error=invalidimagetype");
                exit;
            }

            $image_data = base64_decode($image_data);
            if ($image_data === false) {
                header("Location: catalog.php?error=base64decodefailed");
                exit;
            }
        } else {
            header("Location: catalog.php?error=invaliddataurl");
            exit;
        }

        $safe_model_id = preg_replace('/[^a-zA-Z0-9_-]/', '_', $model_id);
        $thumbnail_filename = $safe_model_id . '_' . time() . '.' . $image_type;
        $thumbnail_file_path = GENERATED_THUMBNAILS_DIR . $thumbnail_filename;

        // Save file gambar
        if (file_put_contents($thumbnail_file_path, $image_data)) {
            $thumbnail_db_path = GENERATED_THUMBNAILS_URL_PATH . $thumbnail_filename; 
            error_log("Thumbnail berhasil disimpan di: " . $thumbnail_file_path);
        } else {
            error_log("Gagal menyimpan thumbnail di: " . $thumbnail_file_path . ". Cek hak tulis.");
            header("Location: catalog.php?error=filesavefailed");
            exit;
        }
    } else {
        error_log("Tidak ada data thumbnail yang dikirim untuk model: " . $model_id);
    }

    // $sql = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc)
    //         VALUES (:model_name, :model_id, :thumbnail_path, :model_desc)";

    $sql = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc)
            VALUES (:model_name, :model_id, :final_thumbnail_path, :model_desc)";

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(':model_name', $model_name);
        $stmt->bindParam(':model_id', $model_id);
        $stmt->bindParam(':final_thumbnail_path', $thumbnail_db_path);
        $stmt->bindParam(':model_desc', $model_desc);

        $stmt->execute();

        header("Location: catalog.php?success=modeladded");
        exit;

    } catch (\PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        if ($thumbnail_db_path && file_exists($thumbnail_file_path)) {
            unlink($thumbnail_file_path);
        }
        header("Location: catalog.php?error=dberror&msg=" . urlencode($e->getMessage()));
        exit;
    }
} else {
    header("Location: catalog.php");
    exit;
}
?>