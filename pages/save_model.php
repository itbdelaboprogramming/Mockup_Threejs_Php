<?php
require_once __DIR__ . '/../config/sqlite_db.php'; // change to 'mysql_db.php' if already using MySQL

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $model_name = trim($_POST['model_name'] ?? '');
    $model_id = trim($_POST['model_id'] ?? ''); 
    $thumbnail_path = trim($_POST['thumbnail_path'] ?? null); 
    $model_desc = trim($_POST['model_desc'] ?? null); 

    if (empty($model_name) || empty($model_id)) {
        exit;
    }

    $sql = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc)
            VALUES (:model_name, :model_id, :thumbnail_path, :model_desc)";

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(':model_name', $model_name);
        $stmt->bindParam(':model_id', $model_id);
        $stmt->bindParam(':thumbnail_path', $thumbnail_path); 
        $stmt->bindParam(':model_desc', $model_desc);

        $stmt->execute();

        header("Location: catalog.php");
        exit;

    } catch (\PDOException $e) {
        $errorMessage = $e->getMessage();
        exit;
    }
} else {
    header("Location: catalog.php");
    exit;
}
?>