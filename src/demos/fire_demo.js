
RegisterDemo("Fire", FireDemo);

function FireDemo(rootDiv) {
    
    // Init stuff
    console.log("Start Title");

    rootDiv.innerHTML =
        `<canvas id="titleCanvas" style="width: 640px;height: 480px;" oncontextmenu="return false"></canvas>`;
    let canvas = document.getElementById("titleCanvas");
    let canvasSize = { x: 160, y: 120 };
    canvas.setAttribute("width", `${canvasSize.x}`);
    canvas.setAttribute("height", `${canvasSize.y}`);
    // Toggle fullscreen
    canvas.addEventListener("click", (ev) => {
        if (!document.fullscreenElement) {
            // attempt to enter fullscreen
            canvas.requestFullscreen().catch(err => {
                console.log(`Error entering fullscreen: `, err);
            });
        } else {
            document.exitFullscreen();
        }
        
    });
    
    let ctx = canvas.getContext("2d");
    let w = canvasSize.x;//canvas.clientWidth;
    let h = canvasSize.y;//canvas.clientHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    let fireColours = [
        { r: 0, g: 0, b: 0, a: 255 },
        { r: 25, g: 0, b: 0, a: 255 },
        { r: 25, g: 0, b: 0, a: 255 },
        { r: 50, g: 0, b: 0, a: 255 },
        { r: 50, g: 0, b: 0, a: 255 },
        { r: 75, g: 25, b: 0, a: 255 },
        { r: 75, g: 25, b: 0, a: 255 },
        { r: 100, g: 50, b: 0, a: 255 },
        { r: 100, g: 50, b: 0, a: 255 },
        { r: 200, g: 75, b: 0, a: 255 },
        { r: 200, g: 75, b: 0, a: 255 },
        { r: 200, g: 100, b: 0, a: 255 },
        { r: 200, g: 100, b: 0, a: 255 },
        { r: 200, g: 150, b: 50, a: 255 },
        { r: 200, g: 150, b: 50, a: 255 },
        { r: 255, g: 175, b: 100, a: 255 },
        { r: 255, g: 175, b: 100, a: 255 },
        { r: 255, g: 200, b: 150, a: 255 },
        { r: 255, g: 200, b: 150, a: 255 },
        { r: 255, g: 225, b: 200, a: 255 },
        { r: 255, g: 225, b: 200, a: 255 },
        { r: 225, g: 225, b: 255, a: 255 },
        { r: 225, g: 225, b: 255, a: 255 }
    ];

    let PixelToIndex = (x, y, width, height) => {
        return (x + (y * width));
    }

    let TickFire = (deltaTime, fire, fireWidth, fireHeight) => {
        // don't sample the bottom row as it is the 'seed' for the fire and must
        // stay white
        for (let y = 0; y < fireHeight - 1; ++y) {
            for (let x = 0; x < fireWidth; ++x) {
                // this pixel involves sampling the pixel below
                let i = PixelToIndex(x, y + 1, fireWidth, fireHeight);
                let source = fire[i];
                
                let sourceReduction = Math.random() > 0.5 ? 1 : 0;
                source -= sourceReduction;
                //if (Math.random() > 0.5) { source--;  }
                if (source < 0) { source = 0; }
                let xOffset = Math.random() > 0.5 ? 1 : 0;
                // Set
                let selfIndex = PixelToIndex(x + xOffset, y, fireWidth, fireHeight);
                fire[selfIndex] = source;

            }
        }
    }

    let CopyFireArray = (imgData, arr) => {
        let l = arr.length;
        let bmp = imgData.data;
        // No bounds checking or anything here!
        for (let i = 0; i < l; ++i) {
            let j = i * 4;
            let c = fireColours[arr[i]];
            bmp[j] = c.r;
            bmp[j + 1] = c.g;
            bmp[j + 2] = c.b;
            bmp[j + 3] = c.a;
        }
    }

    // Prepare fire canvas and buffer
    let fireCanvas = ctx.createImageData(w, h);
    let totalPixels = fireCanvas.width * fireCanvas.height;
    let fire = new Array(totalPixels).fill(0);
    // Fill bottom row with white (top most index)
    let whiteIndex = fireColours.length - 1;
    let i = PixelToIndex(0, fireCanvas.height - 1, fireCanvas.width, fireCanvas.height);
    for (; i < totalPixels; ++i) {
        fire[i] = whiteIndex;
    }
    
    // Frame loop
    let fps = 30;
    let tickTime = 1000 / fps;
    let intervalHandle = setInterval(() => {
        TickFire(tickTime, fire, fireCanvas.width, fireCanvas.height);
        CopyFireArray(fireCanvas, fire);
        ctx.putImageData(fireCanvas, 0, 0);

    }, tickTime);

    this.Destroy = () => {
        clearInterval(intervalHandle);
    };
}