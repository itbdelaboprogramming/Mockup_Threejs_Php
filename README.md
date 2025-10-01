# 3D Model Catalog & Interactive Viewer


<p align="center">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP Badge">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js Badge">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Badge">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge">
</p>

## Description

A web application built with **PHP** and **Three.js** to display a catalog of 3D models (`.glb`) with a some feature for both users and administrators. 

## Key Features

#### User Features
-   **Model Catalog:** Browse an interactive gallery of 3D models.
-   **3D Viewer:** View models in a dedicated viewer with intuitive controls for rotation, panning, and zooming.
-   **Annotations:** View detailed annotations placed on the models. Clicking on an annotation animates the camera to its target location.
-   **Model Animations:** Play and pause built-in model animations.

#### Admin Features
-   **Model Management:** Add, edit, and delete models directly from the catalog.
-   **Thumbnail Generation:** Automatically generate thumbnails for new models during the upload process.
-   **Annotation Management:** Add, edit, and delete annotations on a model, with dynamic placement and real-time updates.
-   **Model Optimization:**
    -   **Simplification:** Reduce the polygon count of a model to improve performance.
    -   **Flat Shading:** Toggle flat shading for a different rendering style.
-   **Model Statistics:** View real-time statistics like vertex and triangle counts.
-   **Scene Tree:** Explore the hierarchical structure of the 3D scene.

## Tech Stack

This project is built using a combination of modern web technologies.

-   **Backend:** PHP with SQLite for database management. A configuration for MySQL is also available.
-   **Frontend:** HTML, CSS, and modular JavaScript.
-   **3D Graphics:** [Three.js](https://threejs.org/) for all 3D rendering, model loading, and interaction.
-   **Key Libraries:**
    -   [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader): To load GLB 3D models.
    -   [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls): For camera control.
    -   [CSS2DRenderer](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer): To render HTML-based annotations within the 3D scene.
    -   [GSAP](https://gsap.com/): For smooth camera animations.
    -   [Vanta.js](https://www.vantajs.com/): For the animated background effects on the login and catalog pages.

## Local Installation & Setup

### Prerequisites
- **XAMPP:** Required to run the **Apache** server and **PHP**.
- **Web Browser** that supports WebGL (Chrome, Firefox, Edge).

### Steps
1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/itbdelaboprogramming/Mockup_Threejs_Php.git](https://github.com/itbdelaboprogramming/Mockup_Threejs_Php.git)
    ```

2.  **Move to `htdocs`:**
    Copy or move the project folder (`Mockup_Threejs_Php`) into the `htdocs` directory within your XAMPP installation (usually located at `C:\xampp\htdocs\`).

3.  **Run XAMPP:**
    Open the XAMPP Control Panel and start the **Apache** service.

4.  **Initialize the Database:**
    - Open browser and navigate to the following URL to create the necessary tables and initial data:
        ```
        http://localhost/path/to/your/project/config/setup_sqlite.php
        ```
    - This page is safe to run multiple times if you wish to reset the database.

5.  **Run the Application:**
    - Access the project's root URL:
        ```
        http://localhost/path/to/your/project/
        ```

## How to Use

#### Adding a New Model
1.  Place your `.glb` file inside the `assets/model/` folder.
2.  On the catalog page, click the `+` button in the top-right corner.
3.  Fill in the model name and the **Model ID** (must be the same as the `.glb` filename **without the extension**).
4.  Click "Save". The application will automatically render the model in the background to create a thumbnail and save it to the database.

#### Usage
-   **Login:** The default admin password is "admin". You can log in as a regular user without a password to view the catalog.
-   **Model Viewer:** Navigate to the viewer page for any model. Use your mouse to control the camera (left-click to orbit, right-click to pan, scroll to zoom).
-   **Admin Panel:** After logging in as an admin, you will see additional buttons in the viewer toolbar. These will open various panels for optimization and annotation.

## File Structure
<pre>
.
├── assets/
│   ├── model/             # Your .glb model files go here
│   ├── thumbnails/      
│   └── ...
├── config/
│   ├── mysql_db.php     
│   ├── setup_sqlite.php   # Script to initialize SQLite DB
│   └── sqlite_db.php    
├── css/
│   └── style.css          # Main stylesheet
├── doc/                   # Project Documentation
├── js/
│   ├── animation.js
│   ├── annotation.js
│   ├── loader.js
│   ├── main.js
│   └── ...                # All Three.js modules
├── pages/
│   ├── catalog.php        # Model catalog page
│   ├── login.php          # Login page
│   ├── viewer.php         # The main 3D viewer
│   └── ...                # PHP backend scripts
├── index.php              # Main entry point
└── README.md
</pre>
