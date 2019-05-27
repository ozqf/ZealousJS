
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

    let fireCanvas = ctx.createImageData(128, 128);
    let data = fireCanvas.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
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

    let FindColourIndex = (red) => {
        for (let i = 0; i < fireColours.length; ++i) {
            if (fireColours[i].r === red) { return i; }
        }
        // hmm ?
        return 999999;
    };

    let SetPixel = (data, i, r, g, b, a) => {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
    }

    let StepPixel = (imgData, px, py) => {
        let i;
        let w = imgData.width;
        let h = imgData.height;
        let r, g, b, a;
        if (px <= 0) {
            // top of canvas, can't do anything
            i = PixelToIndex(px, py, w, h);
            SetPixel(imgData.data, i, 0, 0, 0, 0);
        } else {
            // Grow
            let currentRed = imgData.data[i];
            let colourIndex = FindColourIndex(currentRed);
            // step colour forward
            colourIndex++;
            if (colourIndex >= fireColours.length) { 
                // Clear
                i = PixelToIndex(px, py, w, h);
                SetPixel(imgData.data, i, 0, 0, 0, 0);
            }
            else {
                i = PixelToIndex(px, py - 1, w, h);
                let c = fireColours[colourIndex];
                SetPixel(imgdata.data, i, c.r, c.g, c.b, 255);
            }
        }
    };

    // Put fire
    ctx.putImageData(fireCanvas, 64, 64);

    setInterval(() => {
        for (let y = 0; y < fireCanvas.height; ++y) {
            for (let x = 0; x < fireCanvas.width; ++x) {
                StepPixel(fireCanvas, x, y);
            }
        }
        ctx.putImageData(fireCanvas, 64, 64);
    }, 1000 / 10);

    this.Destroy = () => {

    }
}