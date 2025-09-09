<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/sqlite_db.php';

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

$id = $data['id'] ?? null;
$label_text = $data['label_text'] ?? null;
$label_pos = $data['label_pos'] ?? null;

if (!$id || (!$label_text && !$label_pos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: ID and either label text or position are required']);
    exit;
}

try {
    $fields = [];
    $params = [':id' => $id];

    if ($label_text) {
        $fields[] = "label_text = :label_text";
        $params[':label_text'] = $label_text;
    }

    if ($label_pos && isset($label_pos['x'], $label_pos['y'], $label_pos['z'])) {
        $fields[] = "label_pos_x = :label_pos_x";
        $fields[] = "label_pos_y = :label_pos_y";
        $fields[] = "label_pos_z = :label_pos_z";
        $params[':label_pos_x'] = $label_pos['x'];
        $params[':label_pos_y'] = $label_pos['y'];
        $params[':label_pos_z'] = $label_pos['z'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit;
    }

    $sql = "UPDATE annotations SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute($params);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Annotation updated']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Annotation not found or no changes made']);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>