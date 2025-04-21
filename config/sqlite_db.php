<?php
$db_folder = __DIR__ . '/../database';
$db_path = $db_folder . '/catalog.sqlite';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO('sqlite:' . $db_path, null, null, $options);

} catch (\PDOException $e) {
    die("Failed connect to db: " . $e->getMessage() . " | Path: " . $db_path);
}

?>