# 3D Model Catalog & Interactive Viewer


<p align="center">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP Badge">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js Badge">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Badge">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge">
</p>

## Description

A web application built with **PHP** and **Three.js** to display a catalog of 3D models (`.glb`) with a some feature and interactive viewer. 

## Key Features

#### **Model Management & Display**
- **Model Catalog:** A gallery view for all 3D models stored in the database.
- **Dynamic Model Addition:** A form to add new models, complete with **automatic thumbnail generation** from the `.glb` file.
- **Full 3D Navigation:** Camera controls (Orbit, Pan, Zoom) to view the model from any angle.
- **Auto-Rotation:** A toggle button to enable or disable automatic model rotation, with a clear visual indicator.

#### **Inspection & Analysis**
- **Working Tree (Object Structure):**
    - A hierarchical view of all objects within the 3D model.
    - Toggle the visibility (hide/show) of each object with intuitive icons (●/○).
    - Select an object from the tree to **highlight** the corresponding part on the model.
- **Model Statistics:** Accurately display the number of vertices and triangles.
- **Mesh Optimization (Simplify):** Reduce model complexity in real-time using a slider to improve performance on low-spec devices.

#### **Annotation & Presentation**
- **Complete Annotation System:**
    - **Create, Read, Delete (CRD):** Add annotations to specific points on the model, which are saved to the database.
    - **Edit Annotation Text:** Modify the text of existing annotation labels.
    - **Drag & Drop Labels:** Visually reposition annotation labels to avoid overlap and maintain readability.
- **Lighting & Render Controls:**
    - **Dynamic Light Control:** Adjust the position of the directional light on the X, Y, and Z axes using sliders.
    - **Flat Shading:** An option to change the rendering mode to flat shading.
- **Animation Support:**
    - Full support for `.glb` models that contain animations.
    - **Play/Pause/Stop** controls.

## Technology Stack

| Category      | Technology                                    |
| :------------ | :-------------------------------------------- |
| **Backend** | PHP                                           |
| **Database** | SQLite                                        |
| **Frontend** | JavaScript                                    |
| **3D Render** | **Three.js** |
| **Server** | Apache (via XAMPP)                            |

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
        http://localhost/Mockup_Threejs_Php/config/setup_sqlite.php
        ```
    - This page is safe to run multiple times if you wish to reset the database.

5.  **Run the Application:**
    - Access the project's root URL:
        ```
        http://localhost/Mockup_Threejs_Php/
        ```

## How to Use

#### Adding a New Model
1.  Place your `.glb` file inside the `assets/model/` folder.
2.  On the catalog page, click the `+` button in the top-right corner.
3.  Fill in the model name and the **Model ID** (must be the same as the `.glb` filename **without the extension**).
4.  Click "Save". The application will automatically render the model in the background to create a thumbnail and save it to the database.

#### Navigating the Viewer
- **Opening a Model:** Click on a model card in the catalog.
- **Accessing Features:** Use the vertical toolbar on the left to show or hide control panels like the Working Tree, Optimizer, and others.
- **Model Interaction:**
    - **Orbit:** Left-click & drag.
    - **Pan:** Right-click & drag.
    - **Zoom:** Use the mouse scroll wheel.
