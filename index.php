<?php
session_start();
if (!isset($_SESSION['role'])) {
    header("Location: pages/login.php");
    exit;
} else {
    header("Location: pages/catalog.php");
    exit;
}
?>