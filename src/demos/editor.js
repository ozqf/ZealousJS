
RegisterDemo("Editor", GridEditor);

function WriteGridToStr(gridEnts, w, h)
{
    let str = "";
    for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
            let index = x + (y * w);
            let ent = gridEnts[index];
            switch (ent.cell.type) {
                case 1: str += " "; break;
                default: str += '#'; break;
            }
        }
        str += "\r\n";
    }
    return str;
}

function GridEditor(rootDiv) {
    const TAG_NONE = 0;
    const TAG_CELL = 1;
    const TAG_OUTLINE = 2;

    // Grid data/stats
    let gridDisplayEntities = [];
    let gridEntities = [];
    let gridWidth = 32;
    let gridHeight = 32;

    let pix2Metre = 16;
    let halfPix2Metre = pix2Metre / 2;

    console.log(`Start Editor`);
    let w = 800;//640;
    let h = 600;//480;
    let canvas = CreateCanvas(rootDiv, "fireCanvas", w, h, w, h);

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    /////////////////////////////////////////////////////
    // Grid operations
    /////////////////////////////////////////////////////

    let ClearAllCells = () => {
        for (let i = 0; i < gridEntities.length; ++i) {
            gridEntities[i].colour = '#111111';
            gridEntities[i].cell.type = 0;
        }
    }

    let SetCellType = (box, type) => {
        switch (type) {
            case 1:
                box.cell.type = type;
                box.colour = '#00ff00';
            break;
            default:
            box.cell.type = 0;
            box.colour = '#111111';
            break;
        }
    }

    /////////////////////////////////////////////////////
    // Tick
    /////////////////////////////////////////////////////
    let WorldTickCallback = (gs, input, deltaTime) => {
        let cursorEnt = gs.FindEntById(cursorId);
	    if (cursorEnt) {
	    	cursorEnt.pos.x = gs.cursorPos.x;
	    	cursorEnt.pos.y = gs.cursorPos.y;
        }

        if (input.mouseOneClick) {
            let gridX = Math.floor(gs.cursorPos.x / pix2Metre);
            let gridY = Math.floor(gs.cursorPos.y / pix2Metre);
            //console.log(`Clicked cell ${gridX}/${gridY}`);

            let index = gridX + (gridY * gridWidth);
            let ent = gridEntities[index];
            let newType = 1;
            if (ent.cell.type == 1) { newType = 0; }
            SetCellType(ent, newType);
            /*for (let i = 0; i < gridEntities.length; ++i) {
                gridEntities[i].colour = '#111111';
            }
            gridEntities[index].colour = '#00ff00';*/
            console.log(WriteGridToStr(gridEntities, gridWidth, gridHeight));
        }
    }
    
    
    /////////////////////////////////////////////////////
    // Init world
    /////////////////////////////////////////////////////
    world = new CanvasScene(canvas, WorldTickCallback);
    world.Start(20);

    for (let y = 0; y < gridHeight; ++y) {
        for (let x = 0; x < gridWidth; ++x) {
            // Create display outline for grid cell
            let plotX = (x * pix2Metre) + halfPix2Metre;
            let plotY = (y * pix2Metre) + halfPix2Metre;
            let outline = world.AddOutline(plotX, plotY, halfPix2Metre, halfPix2Metre, '#111111');
            outline.tag = TAG_OUTLINE;
            outline.gridX = x;
            outline.gridY = y;
            gridDisplayEntities.push(outline);

            // Create grid cell itself
            plotX = (x * pix2Metre) + halfPix2Metre;
            plotY = (y * pix2Metre) + halfPix2Metre;
            let box = world.AddBox(plotX, plotY, halfPix2Metre, halfPix2Metre, '#111111');
            box.tag = TAG_CELL;
            box.cell = { x: x, y: y, type: 0 };
            gridEntities.push(box);
        }
    }
    console.log(`Created ${gridEntities.length} grid cells`);

    cursor = world.AddOutline(0, 0, 8, 8, '#00ffff');
    cursorId = cursor.id;
    
    this.Destroy = () => {
        rootDiv.innerHTML = "";
    };
}