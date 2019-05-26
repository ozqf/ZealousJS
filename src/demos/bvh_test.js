
/*

*/

RegisterDemo("BVH Demo", BVHDemo);

function BVHDemo(rootDiv) {

    // Init stuff
    console.log("Start BVH Demo");

    rootDiv.innerHTML =
    `<canvas id="canvas"></canvas>`;
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

    //////////////////////////////////////////////////////////////
    // #defines
    //////////////////////////////////////////////////////////////
    // WORLD TAGS
    const TAG_BOXES = 1;
    const TAG_BVH_OUTLINE = 2;
    const TAG_CURSOR_BOX = 3;
    const TAG_BVH_DRAW = 4;

    // GRAPH TAGS
    const TAG_GRAPH_NODE = 1;

    const COLOUR_BOX_DEFAULT = "#ff0000ff";
    const COLOUR_BOX_OVERLAP = "#00ffffff";

    const COLOUR_BVH_DEFAULT = "#999999ff";
    const COLOUR_BVH_OVERLAP = "#ffff00ff";
    const COLOUR_BVH_LINK = "#ff00ffff";

    const WORLD_FRAME_RATE = 20;

    //////////////////////////////////////////////////////////////
    // Demo globals
    //////////////////////////////////////////////////////////////
    let world = null;
    let cursor = null;

    let cursorId = -1;
    let treeStats = "";
    let debugText = "";
    let peakVisits = 0;

    let bvhSettings = {
        continuous: true,
        playing: true,
        shuffle: false,
        sort: false,
        drawTree: true
    };

    //////////////////////////////////////////////
    // Demo lifetime
    this.Destroy = () => {
        // Full shutdown and cleanup
    };


    ////////////////////////////////////////////////////////////////////
    // Frame loop
    ////////////////////////////////////////////////////////////////////
    let WorldTickCallback = (gs, input, deltaTime) => {
        let cursor = gs.FindEntById(cursorId);
	    if (cursor) {
	    	cursor.pos.x = gs.cursorPos.x;
	    	cursor.pos.y = gs.cursorPos.y;
        }
    };

    ////////////////////////////////////////////////////////////////////
    // Creating the BVH
    ////////////////////////////////////////////////////////////////////
    let Shape2Node = (bvh, shape) => {
        let node = new HeapBvhNode(bvh, null);
        node.aabb = shape.ToAABB();
        node.aabb.minX -= bvh.padding;
        node.aabb.minY -= bvh.padding;
        node.aabb.maxX += bvh.padding;
        node.aabb.maxY += bvh.padding;
        node.userData = shape.id;
        return node;
    };
    let BuildBvhOverShapes = (gs) => {
        if (gs.bvh) {
            gs.bvh.Clear();
        }
        else {
            gs.bvh = new HeapBvh();
        }
        /*
        peakVisits = 0;
        let shapes = gs.FindAllByTag(TAG_BOXES);
        if (bvhSettings.shuffle) {
            // Shuffle shapes to rearrange insertion order
            // (improves tree balance)
            Shuffle(shapes);
        }
        if (bvhSettings.sort) {
            SortShapes(shapes);
        }
        */
        let numShapes = shapes.length;
        for (let i = 0; i < numShapes; ++i) {
            let shape = shapes[i];
            let node = Shape2Node(bvh, shape);
            bvh.Insert(node);
        }
        let numNodes = numShapes + (numShapes - 1);
        // gs.bvh.nextNodeId
        /*let stats = `BVH Stats: Leaves: ${numShapes} `;
        stats += `Nodes: ${gs.bvh.nextNodeId}, Total volume: ${Math.ceil(bvh.TotalVolume())} Height: ${bvh.depth}`;
        SetTreeStats(stats);*/
        return bvh;
    };
    
    ////////////////////////////////////////////////////////////////////
    // Drawing the BVH
    ////////////////////////////////////////////////////////////////////
    let AddBvhNodeOutline = (gs, node) => {
        let hw = (node.aabb.maxX - node.aabb.minX) / 2;
        let hh = (node.aabb.maxY - node.aabb.minY) / 2;
        let outline = gs.AddOutline(node.aabb.minX + hw, node.aabb.minY + hh, hw, hh, '#ffff00');
        outline.externalId = node.id;
        outline.tag = TAG_BVH_OUTLINE;
        if (node.parent) {
            // Draw line between parent and self centroid
            let a = node.parent.aabb;
            let b = node.aabb;
            
            let line = gs.AddLine(
                BvhAABBX(a),
                BvhAABBY(a),
                BvhAABBX(b),
                BvhAABBY(b),
                COLOUR_BVH_LINK
            );
    
            line.externalId = node.id;
            line.tag = TAG_BVH_OUTLINE;
        }
    };

    let DrawBvh = (gs, bvh) => {
        gs.RemoveAllByTag(TAG_BVH_OUTLINE);
        let numNodes = 0;
        // Build display outlines
        gs.bvh.Traverse(node => {
            AddBvhNodeOutline(gs, node);
            numNodes++;
        });
    };
    
    ////////////////////////////////////////////////////////////////////
    // Init
    ////////////////////////////////////////////////////////////////////
    world = new CreateEngineInstance("canvas", WorldTickCallback);
    world.Start(WORLD_FRAME_RATE);

    cursor = world.AddOutline(0, 0, 32, 32, '#00ffff');
    cursorId = cursor.id;
    

}
