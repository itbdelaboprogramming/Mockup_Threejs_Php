<?php
session_start();

$admin_password = "admin";

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["login_as_user"])) {
    $_SESSION["role"] = "user";
    header("Location: catalog.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["admin_password"])) {
    $password = $_POST["admin_password"] ?? "";

    if ($password === $admin_password) {
        $_SESSION["role"] = "admin";
        header("Location: catalog.php");
        exit;
    } else {
        $error = "Wrong password.";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="../css/style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>
</head>
<body class="login-page">
    <div id="vanta-bg"></div>
    <div class="main-login-container">
        <!-- <h1 class="main-title">L O G I N</h1> -->
        <div class="card-wrapper">
            <div class="login-card user-card" id="user-card">
                <div class="card-content">
                    <span class="card-icon">👤</span>
                    <h2 class="card-subtitle">U S E R</h2>
                </div>
            </div>

            <div class="login-card admin-card flip-container" id="admin-card">
                <div class="flipper">
                    <div class="card-side card-front">
                        <div class="card-content">
                            <span class="card-icon">🔒</span>
                            <h2 class="card-subtitle">A D M I N</h2>
                        </div>
                    </div>
                    <div class="card-side card-back">
                        <button class="back-button" id="back-to-front">&larr;</button>
                        <h2 class="card-subtitle">Password</h2>
                        <form action="login.php" method="POST" class="login-form">
                            <input type="password" name="admin_password" placeholder="Password..." required class="form-input">
                            <button type="submit" class="form-submit-button">Login</button>
                        </form>
                        <?php if (isset($error)): ?>
                            <p class="error"><?php echo htmlspecialchars($error); ?></p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        VANTA.NET({
            el: "#vanta-bg",
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x04445f,
            backgroundColor: 0x222222,
            points: 10.00,
            maxDistance: 16.00,
            spacing: 13.00
        })

        document.addEventListener('DOMContentLoaded', () => {
            const userCard = document.getElementById('user-card');
            const adminCard = document.getElementById('admin-card');
            const backBtn = document.getElementById('back-to-front');

            // USER
            userCard.addEventListener('click', () => {
                const form = document.createElement('form');
                form.action = 'login.php';
                form.method = 'POST';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'login_as_user';
                input.value = '1';
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            });

            // ADMIN
            adminCard.addEventListener('click', () => {
                adminCard.classList.add('is-flipped');
            });

            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                adminCard.classList.remove('is-flipped');
            });
            
            <?php if (isset($error)): ?>
                adminCard.classList.add('is-flipped');
            <?php endif; ?>
        });
    </script>
</body>
</html>