<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/sqlite_db.php';

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data || !isset($data['model_id']) || !isset($data['label_text']) || !isset($data['target_point'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

$model_id = $data['model_id'];
$label_text = $data['label_text'];
$target_point = $data['target_point'];

if (empty($model_id) || empty($label_text) || !is_array($target_point) || !isset($target_point['x'])) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

try {
    $sql = "INSERT INTO annotations (model_id, label_text, target_x, target_y, target_z) VALUES (:model_id, :label_text, :target_x, :target_y, :target_z)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':model_id' => $model_id,
        ':label_text' => $label_text,
        ':target_x' => $target_point['x'],
        ':target_y' => $target_point['y'],
        ':target_z' => $target_point['z']
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Annotation saved']);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>