
/*

*/

RegisterDemo("BVH Demo", BVHDemo);

function BVHDemo(rootDiv) {

    // Init stuff
    console.log("Start BVH Demo");

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
        world.Destroy();
        rootDiv.innerHTML = "";
    };


    ////////////////////////////////////////////////////////////////////
    // Frame loop
    ////////////////////////////////////////////////////////////////////
    let UpdateDynamicBvh = (gs, bvh) => {
        // Continuous mode:
        // Check for objects moving out of their tree bounding boxes.
        // these shapes must be removed and reinserted.
        let rogueShapes = [];
        let rogueNodes = [];
        gs.bvh.Traverse((node) => {
            if (!node.IsLeaf()) { return; }
            let shape = gs.FindEntById(node.userData);
            if (shape === null)
            { console.warn(`No shape ${node.userData}`); return; }
            if (BvhAABBContains(node.aabb, shape.ToAABB()) === false) {
                rogueShapes.push(shape);
                rogueNodes.push(node);
            }
        });
        // Remove invalid nodes
        for (let i = rogueNodes.length - 1; i >= 0; --i) {
            BvhRemove(gs.bvh, rogueNodes[i]);
        }
        // Add back moved shapes
        for (let i = rogueShapes.length - 1; i >= 0; --i) {
            gs.bvh.Insert(Shape2Node(gs.bvh, rogueShapes[i]));
        }
        DrawBvh(gs, gs.bvh);
    };

    let WorldTickCallback = (gs, input, deltaTime) => {
        let cursor = gs.FindEntById(cursorId);
	    if (cursor) {
	    	cursor.pos.x = gs.cursorPos.x;
	    	cursor.pos.y = gs.cursorPos.y;
        }
        
        let shapes = gs.FindAllByTag(TAG_BOXES);
        gs.StepShapes(shapes, deltaTime);
        UpdateDynamicBvh(gs, gs.bvh);
        gs.dirty = true;

        if (input.mouseOneClick) {
            // Add shape, rebuild tree
            let box = gs.AddBox(cursor.pos.x, cursor.pos.y, 6, 6, COLOUR_BOX_DEFAULT);
            box.tag = TAG_BOXES;
            let radians = Math.random() * (Math.PI * 2);
            let speed = (Math.random() * 64) + 32;
            box.vel.x = Math.cos(radians) * speed;
            box.vel.y = Math.sin(radians) * speed;
            if (bvhSettings.continuous) {
                let node = gs.bvh.Insert(Shape2Node(gs.bvh, box));
                DrawBvh(gs, gs.bvh);
            }
            else {
                RebuildTree();
            }
            
            gs.dirty = true;
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
        let shapes = gs.FindAllByTag(TAG_BOXES);
        /*
        peakVisits = 0;
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
        return gs.bvh;
    };

    let ClearScene = () => {
        world.RemoveAllByTag(TAG_BOXES);
        RebuildTree();
    }
    
    let RebuildTree = () => {
        let start = performance.now();
        world.bvh = BuildBvhOverShapes(world);
        let end = performance.now();
        //console.log(`  build in ${end - start}ms`);
        DrawBvh(world, world.bvh);
        world.dirty = true;
    }
    
    
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
    
    RebuildTree();
}
