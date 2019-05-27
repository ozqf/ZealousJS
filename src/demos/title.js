
RegisterDemo("Title", TitleDemo);

function TitleDemo(rootDiv) {
    
    // Init stuff
    console.log("Start Title");

    rootDiv.innerHTML =
    `<canvas id="canvas" oncontextmenu="return false"></canvas>`;
    let canvas = document.getElementById("canvas");

    //canvas.setAttribute("class", "world-canvas");
    canvas.setAttribute("width", "550px");
    canvas.setAttribute("height", "450px");

    let ctx = canvas.getContext("2d");
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    console.log(`Canvas: ${w}, ${h}`);

    let fireCanvas = ctx.createImageData(32, 32);
    let data = fireCanvas.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 255;
        data[i + 2] = 0;
        data[i + 3] = 255;
    }

    let PixelToIndex = (x, y, width, height) => {
        return (x + (y * width))  * 4;
        //return (x * height) + y;
    }
    
    let fireColours = [
        { r: 255, g: 255, b: 255 },
        { r: 225, g: 225, b: 225 },
        { r: 200, g: 200, b: 200 },
        { r: 175, g: 175, b: 175 },
        { r: 150, g: 150, b: 150 },
        { r: 125, g: 125, b: 125 },
        { r: 100, g: 100, b: 100 },
        { r: 75, g: 75, b: 75 },
        { r: 50, g: 50, b: 50 },
        { r: 25, g: 25, b: 25 }
    ];

    let StepPixel = (imgData, px, py) => {
        let i = PixelToIndex(px, py, imgData.width, imgData.height);
        console.log(`Set pixel ${i} - ${px}, ${py}`);
        imgData.data[i] = 255;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
    };
    StepPixel(fireCanvas, 0, 0);
    StepPixel(fireCanvas, 1, 0);
    StepPixel(fireCanvas, 2, 0);
    StepPixel(fireCanvas, 3, 0);
    StepPixel(fireCanvas, 4, 0);

    // Put fire
    ctx.putImageData(fireCanvas, 64, 64);

    this.Destroy = () => {

    }
}