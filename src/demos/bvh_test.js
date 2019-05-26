
/*

*/

RegisterDemo("BVH Demo", BVHDemo);

function BVHDemo(rootDiv) {

    // Init stuff
    console.log("Start BVH Demo");

    rootDiv.innerHTML =
    `<canvas id="canvas"></canvas>`;
    let canvas = document.getElementById("canvas");

    canvas.setAttribute("class", "world-canvas");
    let ctx = canvas.getContext("2d");
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    console.log(`Canvas: ${w}, ${h}`);

    

    this.Destroy = () => {
        // Full shutdown and cleanup
    };
}
