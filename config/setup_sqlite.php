<?php

// NOTES:
// Skrip ini untuk inisialisasi atau reset database SQLite.
// Jalankan dengan mengakses: localhost/Mockup_Threejs_Php/config/setup_sqlite.php

require_once 'sqlite_db.php'; 

try {
    $pdo->exec("DROP TABLE IF EXISTS model");
    $pdo->exec("DROP TABLE IF EXISTS annotations");
    echo "Tables 'model' and 'annotations' deleted successfully..<br>";

    $sqlCreateModel = "
    CREATE TABLE IF NOT EXISTS model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(255) NOT NULL,
        model_id VARCHAR(100) NOT NULL UNIQUE,
        thumbnail_path VARCHAR(255),
        model_desc TEXT
    );";
    $pdo->exec($sqlCreateModel);
    echo "New 'model' table created successfully.<br>";

    $sqlCreateAnnotations = "
    CREATE TABLE IF NOT EXISTS annotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id VARCHAR(100) NOT NULL,
        label_text TEXT NOT NULL,
        target_x REAL NOT NULL,
        target_y REAL NOT NULL,
        target_z REAL NOT NULL,
        label_pos_x REAL,
        label_pos_y REAL,
        label_pos_z REAL
    );";
    $pdo->exec($sqlCreateAnnotations);
    echo "New 'annotations' table created successfully.<br>";

    // init sample data (empty for now)
    $sampleModels = [
    ];

    // init sample annotations (empty for now)
    $sampleAnnotations = [
    ];

    $sqlInsertModel = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc) VALUES (:nama, :id_model, :thumb, :desc)";
    $stmt_model = $pdo->prepare($sqlInsertModel); 

    foreach ($sampleModels as $modelData) {
        $stmt_model->execute([
            ':nama' => $modelData['name'],
            ':id_model' => $modelData['id'],
            ':thumb' => $modelData['thumb'],
            ':desc' => $modelData['desc']
        ]);
    }

    $sqlInsertAnnotation = "INSERT INTO annotations (model_id, label_text, target_x, target_y, target_z) VALUES (:model_id, :label_text, :target_x, :target_y, :target_z)";
    $stmt_annotation = $pdo->prepare($sqlInsertAnnotation); 

    foreach ($sampleAnnotations as $annoData) {
        $stmt_annotation->execute([
            ':model_id' => $annoData['model_id'],
            ':label_text' => $annoData['label'],
            ':target_x' => $annoData['x'],
            ':target_y' => $annoData['y'],
            ':target_z' => $annoData['z']
        ]);
    }

    echo "<h3 style='color:green;'>Database setup finished!</h3>";

} catch (\PDOException $e) {
    echo "<p style='color:red;'><strong>Error setup database:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
}

$pdo = null;

?>