import "./style.css";

// App container
const appContainer = document.createElement("div");
const appDiv = document.getElementById("app") as HTMLElement;
appContainer.id = "appContainer"; // Set the ID for styling

appDiv.appendChild(appContainer);

// Add a title
const title = document.createElement("h1");
title.innerText = "Sticker Sketchpad";
appDiv.appendChild(title);

// Create and add a canvas element of size 256x256
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas"; // For CSS styling
appDiv.appendChild(canvas);
