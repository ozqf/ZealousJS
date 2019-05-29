
function CreateCanvas(
    rootDiv,
    canvasDivId,
    screenWidth,
    screenHeight,
    canvasWidth,
    canvasHeight) {
    rootDiv.innerHTML =
        `<canvas id="${canvasDivId}" style="width: ${screenWidth}px;height: ${screenHeight}px;" oncontextmenu="return false"></canvas>`;
    let canvas = document.getElementById(canvasDivId);
    canvas.setAttribute("width", `${canvasWidth}`);
    canvas.setAttribute("height", `${canvasHeight}`);
    return canvas;
}
