<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/sqlite_db.php';

$model_id = $_GET['model_id'] ?? null;

if (!$model_id) {
    echo json_encode(['error' => 'Model ID is required']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, label_text, target_x, target_y, target_z, label_pos_x, label_pos_y, label_pos_z FROM annotations WHERE model_id = :model_id");
    $stmt->execute(['model_id' => $model_id]);
    $annotations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($annotations);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
}
?>