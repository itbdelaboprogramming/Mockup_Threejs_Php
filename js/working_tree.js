function populateSceneTree(rootObject, outlinePass, scene) {
  const treeContainer = document.getElementById("scene-tree");
  if (!treeContainer) {
    console.error("Element with ID 'scene-tree' not found.");
    return;
  }

  treeContainer.innerHTML = "";
  rootObject.children.forEach((child) => {
    buildTree(child, treeContainer);
  });

  addTreeEventListeners(treeContainer, outlinePass, scene);
}

function buildTree(object, parentElement) {
  if (object.isCSS2DObject || object.isLine) return;

  const listItem = document.createElement("li");
  listItem.dataset.uuid = object.uuid;
  
  const hasChildren = object.children.some(child => !child.isCSS2DObject && !child.isLine);
  if (hasChildren) {
    listItem.classList.add("is-parent");
  }

  const visIcon = document.createElement("span");
  visIcon.classList.add("vis-icon");
  
  visIcon.textContent = object.visible ? "●" : "○";
  
  visIcon.classList.toggle("visible", object.visible);
  visIcon.classList.toggle("hidden", !object.visible);
  listItem.appendChild(visIcon);

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("node-name");
  nameSpan.textContent = object.name || "Unnamed Object";
  listItem.appendChild(nameSpan);

  parentElement.appendChild(listItem);

  if (hasChildren) {
    const childList = document.createElement("ul");
    listItem.appendChild(childList);
    object.children.forEach((child) => {
      buildTree(child, childList);
    });
  }
}

function addTreeEventListeners(treeContainer, outlinePass, scene) {
  treeContainer.addEventListener("click", (event) => {
    const listItem = event.target.closest("li[data-uuid]");

    if (event.target.matches(".vis-icon")) {
      const icon = event.target;
      const uuid = listItem.dataset.uuid;
      const targetObject = scene.getObjectByProperty("uuid", uuid);
      if (targetObject) {
        targetObject.visible = !targetObject.visible;

        icon.textContent = targetObject.visible ? "●" : "○";
        
        icon.classList.toggle("visible", targetObject.visible);
        icon.classList.toggle("hidden", !targetObject.visible);
      }
    } else if (listItem) {
        const uuid = listItem.dataset.uuid;
        const targetObject = scene.getObjectByProperty("uuid", uuid);

        treeContainer.querySelectorAll("li.selected").forEach((li) => {
            li.classList.remove("selected");
        });
        listItem.classList.add("selected");

        outlinePass.selectedObjects = targetObject ? [targetObject] : [];

        if (listItem.classList.contains("is-parent")) {
            listItem.classList.toggle("expanded");
        }
    } else {
        treeContainer.querySelectorAll("li.selected").forEach((li) => {
            li.classList.remove("selected");
        });
        outlinePass.selectedObjects = [];
    }
  });
}

export { populateSceneTree };