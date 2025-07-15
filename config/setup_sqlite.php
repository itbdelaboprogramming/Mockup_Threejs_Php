<?php

// NOTES:
// Skrip ini untuk inisialisasi atau reset database SQLite.
// Jalankan dengan mengakses: localhost/Mockup_Threejs_Php/config/setup_sqlite.php

require_once 'sqlite_db.php'; 

try {
    $pdo->exec("DROP TABLE IF EXISTS model");
    $pdo->exec("DROP TABLE IF EXISTS annotations");
    echo "Tabel lama (model, annotations) berhasil dihapus.<br>";

    $sqlCreateModel = "
    CREATE TABLE IF NOT EXISTS model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(255) NOT NULL,
        model_id VARCHAR(100) NOT NULL UNIQUE,
        thumbnail_path VARCHAR(255),
        model_desc TEXT
    );";
    $pdo->exec($sqlCreateModel);
    echo "Tabel 'model' berhasil dibuat.<br>";

    $sqlCreateAnnotations = "
    CREATE TABLE IF NOT EXISTS annotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id VARCHAR(100) NOT NULL,
        label_text TEXT NOT NULL,
        target_x REAL NOT NULL,
        target_y REAL NOT NULL,
        target_z REAL NOT NULL
    );";
    $pdo->exec($sqlCreateAnnotations);
    echo "Tabel 'annotations' berhasil dibuat.<br>";

    // init sample data
    $sampleModels = [
        ['name' => 'BH70', 'id' => 'BH70_Colour', 'thumb' => '../assets/thumbnails/generated/BH70_Colour_1752228583.png', 'desc' => ''],
        ['name' => 'BH70 Animation', 'id' => 'BH70_Sticker addition', 'thumb' => '../assets/thumbnails/generated/BH70_Sticker_addition_1747926685.png', 'desc' => ''],
    ];

    // init sample annotations
    $sampleAnnotations = [
        ['model_id' => 'BH70_Colour', 'label' => 'Label A', 'x' => 0.2, 'y' => 1.5, 'z' => 0.8],
        ['model_id' => 'BH70_Colour', 'label' => 'Label B', 'x' => 0.9, 'y' => 1.2, 'z' => 0.1],
        ['model_id' => 'BH70_Colour', 'label' => 'Label C', 'x' => -0.1, 'y' => 0.8, 'z' => -0.7],
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
    echo "Data model awal berhasil dimasukkan.<br>";

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
    echo "Data anotasi awal berhasil dimasukkan.<br>";

    echo "<h3 style='color:green;'>Setup database selesai!</h3>";

} catch (\PDOException $e) {
    echo "<p style='color:red;'><strong>Error saat setup database:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
}

$pdo = null;

?>