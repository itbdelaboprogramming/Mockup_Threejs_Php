<?php

// NOTES:
// Skrip ini hanya dijalankan untuk update tabel catalog sqlite
// localhost/Mockup_Threejs_Php/config/setup_sqlite.php (gunakan)
// TIDAK PERLU dijalankan jika menggunakan MySQL

require_once 'sqlite_db.php'; 

try {
    $pdo->exec("DROP TABLE IF EXISTS model");
    $sqlCreateTable = "
    CREATE TABLE IF NOT EXISTS model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(255) NOT NULL,
        model_id VARCHAR(100) NOT NULL,
        thumbnail_path VARCHAR(255),
        model_desc TEXT
    );";

    $pdo->exec($sqlCreateTable);
    echo "Tabel 'model' berhasil dibuat.<br>";

    $sampleModels = [
        // ['Microhydro System 2', 'Microhydro System 2', '../assets/thumbnails/Micro_2.png', null],
        ['Microhydro System', 'Microhydro_System', '../assets/thumbnails/Micro.png', null],
        ['MSD700', 'MSD700_ブレードモデル_MCLA15A', '../assets/thumbnails/MSD700.png', null],
        ['BH70', 'BH70_Colour', null, null],
        ['MSD700 Bucket', 'MSD700_Bucket_Colour', null, null],
        ['MSD700 Concrete', 'MSD700_Concrete_Colour', null, null],
        ['NE100JP', 'NE100JP_Colour_1', null, null],
        ['NE200IS', 'NE200IS_Colour_1', null, null],
        ['NEBF75', 'NEBF75_Colour', null, null]
    ];

    $sqlInsert = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc) VALUES (:nama, :id_model, :thumb, :desc)";
    $stmt = $pdo->prepare($sqlInsert);

    foreach ($sampleModels as $modelData) {
        $stmt->bindParam(':nama', $modelData[0]);
        $stmt->bindParam(':id_model', $modelData[1]);
        $stmt->bindParam(':thumb', $modelData[2]);
        $stmt->bindParam(':desc', $modelData[3]);
        $stmt->execute();   
    }

} catch (\PDOException $e) {
    echo "<p style='color:red;'>Error saat setup database: " . htmlspecialchars($e->getMessage()) . "</p>";
}

$pdo = null;

?>