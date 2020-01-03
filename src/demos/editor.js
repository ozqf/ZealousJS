
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
    let world;

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

    let IsGridPositionSafe = (x, y) => {
        if (x < 0 || x >= gridWidth) { return false; }
        if (y < 0 || y >= gridHeight) { return false; }
        return true;
    }

    /////////////////////////////////////////////////////
    // Tick
    /////////////////////////////////////////////////////
    let WorldTickCallback = (gs, input, deltaTime) => {
        //gs.dirty = true;
        let cursorEnt = gs.FindEntById(cursorId); 
	    if (cursorEnt) {
	    	cursorEnt.pos.x = gs.cursorPos.x;
	    	cursorEnt.pos.y = gs.cursorPos.y;
        }

        if (gs.GetActions().GetActionValue("1") === 1) {
            //console.log(`Foo`);
        }
        if (gs.GetActionToggledOff("1")) {
            console.log(`Bar`);
            //console.log(WriteGridToStr(gridEntities, gridWidth, gridHeight));
        }

        if (input.mouseOneClick) {
            let gridX = Math.floor(gs.cursorPos.x / pix2Metre);
            let gridY = Math.floor(gs.cursorPos.y / pix2Metre);
            if (IsGridPositionSafe(gridX, gridY)) {
                let index = gridX + (gridY * gridWidth);
                let ent = gridEntities[index];
                let newType = 1;
                if (ent.cell.type == 1) { newType = 0; }
                SetCellType(ent, newType);
            }
        }
    }
    
    
    /////////////////////////////////////////////////////
    // Init world
    /////////////////////////////////////////////////////
    world = new CanvasScene(canvas, WorldTickCallback);
    world.Start(20);

    world.GetActions().AddAction("1", KEY_CODES.space);

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

    let menu1 = world.AddText(48, 16, 96, 32, "Editor", "#ff0000");
    let menu2 = world.AddText(48, 48, 96, 32, "1", "#ff0000");
    menu2.hidden = true;
    let menu3 = world.AddText(48, 80, 96, 32, "2", "#ff0000");
    
    this.Destroy = () => {
        rootDiv.innerHTML = "";
    };
}