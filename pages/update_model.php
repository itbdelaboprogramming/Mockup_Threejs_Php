<?php
session_start();
require_once __DIR__ . '/../config/sqlite_db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: catalog.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['original_model_id'])) {
    header("Location: catalog.php");
    exit;
}

$original_model_id = $_POST['original_model_id'];
$new_model_name = $_POST['model_name'] ?? '';
$new_model_id = $_POST['model_id'] ?? '';
$new_model_desc = $_POST['model_desc'] ?? '';

try {
    if ($original_model_id !== $new_model_id) {
        $sql_check = "SELECT COUNT(*) FROM model WHERE model_id = :new_model_id";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->execute([':new_model_id' => $new_model_id]);
        if ($stmt_check->fetchColumn() > 0) {
            die("Error: Model ID '$new_model_id' is already used.");
        }
    }

    $pdo->beginTransaction();
    $sql_update_model = "UPDATE model SET model_name = :model_name, model_id = :model_id, model_desc = :model_desc WHERE model_id = :original_id";
    $stmt_update_model = $pdo->prepare($sql_update_model);
    $stmt_update_model->execute([
        ':model_name' => $new_model_name,
        ':model_id' => $new_model_id,
        ':model_desc' => $new_model_desc,
        ':original_id' => $original_model_id
    ]);

    if ($original_model_id !== $new_model_id) {
        $sql_update_anno = "UPDATE annotations SET model_id = :new_model_id WHERE model_id = :original_id";
        $stmt_update_anno = $pdo->prepare($sql_update_anno);
        $stmt_update_anno->execute([
            ':new_model_id' => $new_model_id,
            ':original_id' => $original_model_id
        ]);

        $old_glb_path = realpath(__DIR__ . '/../assets/model/' . $original_model_id . '.glb');
        $new_glb_path = realpath(__DIR__ . '/../assets/model/' . $new_model_id . '.glb');
        if (file_exists($old_glb_path) && !empty($new_model_id)) {
            rename($old_glb_path, $new_glb_path);
        }

        $old_thumb_glob = realpath(__DIR__ . '/../assets/thumbnails/generated/' . $original_model_id . '_*.png');
        if ($old_thumb_glob) {
            $old_thumb_path = glob(__DIR__ . '/../assets/thumbnails/generated/' . $original_model_id . '_*.png')[0];
            $timestamp = pathinfo($old_thumb_path, PATHINFO_FILENAME);
            $timestamp = substr($timestamp, strlen($original_model_id . '_'));    
            $new_thumb_path = __DIR__ . '/../assets/thumbnails/generated/' . $new_model_id . '_' . $timestamp . '.png';
            if (file_exists($old_thumb_path) && !empty($new_model_id)) {
                rename($old_thumb_path, $new_thumb_path);
            }
        }
    }

    $pdo->commit();
    header("Location: catalog.php?status=updated");
    exit;

} catch (\PDOException $e) {
    $pdo->rollBack();
    die("Error while updating model: " . htmlspecialchars($e->getMessage()));
} catch (Exception $e) {
    $pdo->rollBack();
    die("File system error: " . htmlspecialchars($e->getMessage()));
}
?>