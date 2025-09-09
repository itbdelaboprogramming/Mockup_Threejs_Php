<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/sqlite_db.php';

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: Annotation ID is required']);
    exit;
}

$id = filter_var($data['id'], FILTER_VALIDATE_INT);

if ($id === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Annotation ID']);
    exit;
}

try {
    $sql = "DELETE FROM annotations WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Annotation deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Annotation not found']);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>