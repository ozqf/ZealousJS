
function CreateCanvas(
    rootDiv,
    screenWidth,
    screenHeight,
    canvasWidth,
    canvasHeight) {
    ootDiv.innerHTML =
        `<canvas id="titleCanvas" style="width: 640px;height: 480px;" oncontextmenu="return false"></canvas>`;
    let canvas = document.getElementById("titleCanvas");
    let canvasSize = { x: 160, y: 120 };
    canvas.setAttribute("width", `${canvasSize.x}`);
    canvas.setAttribute("height", `${canvasSize.y}`);
    
}
