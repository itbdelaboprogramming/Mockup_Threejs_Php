<?php
// Asumsikan Anda memiliki direktori untuk menyimpan thumbnail yang digenerate
// Sesuaikan path ini jika perlu, relatif terhadap save_model.php
define('GENERATED_THUMBNAILS_DIR', __DIR__ . '/../assets/thumbnails/generated/');
define('GENERATED_THUMBNAILS_URL_PATH', '../assets/thumbnails/generated/'); // Path untuk diakses via URL

require_once __DIR__ . '/../config/mysql_db.php'; // atau sqlite_db.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $model_name = trim($_POST['model_name'] ?? '');
    $model_id = trim($_POST['model_id'] ?? '');
    $model_desc = trim($_POST['model_desc'] ?? null);
    $generated_thumbnail_data = $_POST['generated_thumbnail_data'] ?? null; // Ambil data thumbnail

    $thumbnail_db_path = null; // Path yang akan disimpan ke database

    // Validasi dasar
    if (empty($model_name) || empty($model_id)) {
        // Sebaiknya ada penanganan error yang lebih baik di sini,
        // misalnya redirect kembali ke form dengan pesan error.
        // Untuk sekarang, kita exit saja jika ada error.
        header("Location: catalog.php?error=emptyfields");
        exit;
    }

    // Proses dan simpan thumbnail jika data URL ada
    if (!empty($generated_thumbnail_data)) {
        // Buat direktori jika belum ada
        if (!is_dir(GENERATED_THUMBNAILS_DIR)) {
            if (!mkdir(GENERATED_THUMBNAILS_DIR, 0775, true)) { // 0775 agar web server bisa tulis
                // Gagal membuat direktori, mungkin log error atau redirect
                header("Location: catalog.php?error=dircreationfailed");
                exit;
            }
        }

        // Pisahkan tipe gambar dan data base64
        // Contoh data URL: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
        if (preg_match('/^data:image\/(\w+);base64,/', $generated_thumbnail_data, $type)) {
            $image_data = substr($generated_thumbnail_data, strpos($generated_thumbnail_data, ',') + 1);
            $image_type = strtolower($type[1]); // png, jpeg, dll.

            if (!in_array($image_type, ['jpg', 'jpeg', 'gif', 'png'])) {
                // Tipe gambar tidak didukung
                header("Location: catalog.php?error=invalidimagetype");
                exit;
            }

            $image_data = base64_decode($image_data);
            if ($image_data === false) {
                // Gagal decode base64
                header("Location: catalog.php?error=base64decodefailed");
                exit;
            }
        } else {
            // Format data URL tidak valid
            header("Location: catalog.php?error=invaliddataurl");
            exit;
        }

        // Buat nama file yang unik untuk thumbnail
        // Menggunakan model_id dan timestamp untuk menghindari konflik
        // Sanitasi model_id untuk nama file
        $safe_model_id = preg_replace('/[^a-zA-Z0-9_-]/', '_', $model_id);
        $thumbnail_filename = $safe_model_id . '_' . time() . '.' . $image_type;
        $thumbnail_file_path = GENERATED_THUMBNAILS_DIR . $thumbnail_filename;

        // Simpan file gambar
        if (file_put_contents($thumbnail_file_path, $image_data)) {
            $thumbnail_db_path = GENERATED_THUMBNAILS_URL_PATH . $thumbnail_filename; // Path untuk disimpan di DB
            error_log("Thumbnail berhasil disimpan di: " . $thumbnail_file_path);
        } else {
            // Gagal menyimpan file, cek hak tulis direktori
            error_log("Gagal menyimpan thumbnail di: " . $thumbnail_file_path . ". Cek hak tulis.");
            header("Location: catalog.php?error=filesavefailed");
            exit;
        }
    } else {
        // Tidak ada data thumbnail yang dikirim, mungkin set ke null atau path placeholder
        // $thumbnail_db_path = null; // atau path ke placeholder default jika diinginkan
        error_log("Tidak ada data thumbnail yang dikirim untuk model: " . $model_id);
    }

    // Sekarang simpan path thumbnail ke database
    // Kolom thumbnail_path di SQL INSERT yang lama mungkin perlu disesuaikan
    // Jika sebelumnya Anda mengharapkan path manual, sekarang ini diisi oleh $thumbnail_db_path

    // $sql = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc)
    //         VALUES (:model_name, :model_id, :thumbnail_path, :model_desc)";
    // Pastikan query Anda menggunakan :thumbnail_path

    $sql = "INSERT INTO model (model_name, model_id, thumbnail_path, model_desc)
            VALUES (:model_name, :model_id, :final_thumbnail_path, :model_desc)";

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(':model_name', $model_name);
        $stmt->bindParam(':model_id', $model_id);
        // Gunakan $thumbnail_db_path yang sudah diproses
        $stmt->bindParam(':final_thumbnail_path', $thumbnail_db_path);
        $stmt->bindParam(':model_desc', $model_desc);

        $stmt->execute();

        header("Location: catalog.php?success=modeladded");
        exit;

    } catch (\PDOException $e) {
        // Tangani error database, mungkin log atau tampilkan pesan
        error_log("Database error: " . $e->getMessage());
        // Hapus file thumbnail yang mungkin sudah dibuat jika insert DB gagal
        if ($thumbnail_db_path && file_exists($thumbnail_file_path)) {
            unlink($thumbnail_file_path);
        }
        header("Location: catalog.php?error=dberror&msg=" . urlencode($e->getMessage()));
        exit;
    }
} else {
    // Bukan POST request, redirect ke katalog
    header("Location: catalog.php");
    exit;
}
?>