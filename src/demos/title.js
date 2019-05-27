
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


    this.Destroy = () => {

    }
}