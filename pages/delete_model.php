<?php
session_start();
require_once __DIR__ . '/../config/sqlite_db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: catalog.php");
    exit;
}

if (!isset($_GET['model_id'])) {
    header("Location: catalog.php");
    exit;
}

$model_id = $_GET['model_id'];

try {
    $sql_get_thumb = "SELECT thumbnail_path FROM model WHERE model_id = :model_id";
    $stmt_get_thumb = $pdo->prepare($sql_get_thumb);
    $stmt_get_thumb->execute([':model_id' => $model_id]);
    $model = $stmt_get_thumb->fetch();

    if ($model) {
        $thumbnail_path = realpath(__DIR__ . '/../' . $model['thumbnail_path']);
        $model_file_path = realpath(__DIR__ . '/../assets/model/' . $model_id . '.glb');
        if ($thumbnail_path && file_exists($thumbnail_path) && strpos($model['thumbnail_path'], 'placeholder.png') === false) {
            unlink($thumbnail_path);
        }

        // if ($model_file_path && file_exists($model_file_path)) {
        //     unlink($model_file_path);
        // }
    }

    $sql_delete_annotations = "DELETE FROM annotations WHERE model_id = :model_id";
    $stmt_annotations = $pdo->prepare($sql_delete_annotations);
    $stmt_annotations->execute([':model_id' => $model_id]);
    $sql_delete_model = "DELETE FROM model WHERE model_id = :model_id";
    $stmt_model = $pdo->prepare($sql_delete_model);
    $stmt_model->execute([':model_id' => $model_id]);

    header("Location: catalog.php?status=deleted");
    exit;

} catch (\PDOException $e) {
    die("Error while deleting model: " . htmlspecialchars($e->getMessage()));
}