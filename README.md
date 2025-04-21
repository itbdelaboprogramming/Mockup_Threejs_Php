# Mockup_Threejs_Php
A mock-up of dashboard for displaying the GLB file format into a PHP programming language &amp; ThreeJs (a JavaScript 3D library)

<h2> Project Structure</h2>

<pre>
.
├── assets
│   ├── model              # Location for .glb model files
│   ├── thumbnails
├── config
│   ├── mysql_db.php       # Database connection configuration if using MySQL
│   ├── setup_sqlite.php
│   ├── sqlite_db.php      # Database connection configuration if using SQLite (default)
├── css
│   ├── style.css
├── database                
│   ├── catalog.sqlite     # Database file if using SQLite
├── js
│   ├── main.js
├── pages
│   ├── catalog.php
│   ├── save_model.php
│   ├── viewer.php
├── index.php
└── README.md
              
</pre>

## Requirements / Prerequisites

1.  **XAMPP:** The required components to run are **Apache** and **MySQL**.
2.  **Git:** For cloning this repository.

## Local Setup / Installation

1.  **Clone Repository:**
    Navigate to the directory where you want to store the project, and run:
    ```bash
    git clone https://github.com/itbdelaboprogramming/Mockup_Threejs_Php.git
    cd Mockup_Threejs_Php
    ```
2.  **Move to `htdocs`:**
    Copy or move the cloned project folder (`Mockup_Threejs_Php`) into the `htdocs` directory within your XAMPP installation (usually `C:\xampp\htdocs\`).

3.  **Run XAMPP:**
    Open the XAMPP Control Panel and click "Start" for the **Apache** and **MySQL** services. Ensure both are running without errors (status turns green).

4.  **Verify Assets:** Ensure the `assets/model/` and `assets/thumbnails/` folders, along with their respective files (matching the database entries).

## Running the Application

1.  Ensure Apache and MySQL are running in the XAMPP Control Panel.
2.  Open your web browser.
3.  Access the project's root URL on your local XAMPP server:
    ```
    http://localhost/Mockup_Threejs_Php/
    ```
4.  You will be automatically redirected to the catalog page (`pages/catalog.php`).
5.  Click on a model card to navigate to the 3D viewer page (`pages/viewer.php`).

## Known Issues / TODO

* **`php -S` Issue:** Database connection fails ("could not find driver") when run via PHP's built-in server (`php -S`) due to PHP CLI environment configuration / dependency issues. **Workaround:** Consistently use the XAMPP Apache server to run this project.
* **CRUD:** Edit and Delete features for models are not yet implemented.
* **Model Manipulation:** No UI controls yet for changing the scale and position of the loaded model in the viewer.
