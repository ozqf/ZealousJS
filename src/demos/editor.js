
RegisterDemo("Editor", GridEditor);

let editor_level_1_asci = 
`################################################################################################
##########################   ###    ############################################################
########################## #        ############################################################
##########################         #############################################################
##############################   # ######## ####################################################
##############################  ##  #######  ###################################################
###            ##############  #### ########     ######### #####################################
##     ####     ############   #### ############  ######## #####################################
#                ########    # #### ############  ########   ###################################
#                   #####    # ####  ########### #########    ##################################
#                ##  ###     # ##### ########### #####  ####       #############################
##     ####     ####  #  ###   ##### ########### ####   ####            ########################
###            ######   #### ####### ########### ###  #  #    #### #### ########################
##################     ##### #####    #######    ### ##  # #  ###  ##############            ###
##############      ######## # ### #   ###     ####  ##    #####    ############     ####     ##
##############      ########       ##  #   ##  ###  ###   #####  ## ###########                #
################  # ########      ###    ##     #  #####  ####  ###  ######                    #
################### ###########   #### ####       #         #  ##### #        #                #
############################################## #  #  ### #    ######   #   ## ##     ####     ##
############################################   ######### #   ########    #### ###            ###
############################################  ########## ## #########   ##### ##################
############################################# ##########  ############ ######   ################
#############################################    #######  ################      ################
################################################################################################`;



////////////////////////////////////////////////////////////
// Save and load
////////////////////////////////////////////////////////////

function WriteGridToStr(gridEnts, w, h, tileTypes)
{
    let str = "";
    for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
            let index = x + (y * w);
            let ent = gridEnts[index];
            let tileType = tileTypes[ent.cell.type];
            str += tileType.asciChar;
        }
        str += "\r\n";
    }
    return str;
}

// Defines the geometry properties of a tile for path finding.
// eg an enemy will have its own tile type, but a geom type
// of path, since it cannot exist in a wall.
let TILE_GEOM_TYPES = {
	PATH: 0,
	SOLID: 1,
	VOID: 2
};

function IntGrid(cellsWide, cellsHigh) {
    let _width = cellsWide;
    let _height = cellsHigh
    let _cells = [];
    let totalCells = _width * _height;
    for (let i = 0; i < totalCells; ++i) {
        _cells.push(1);
    }
    this.GetWidth = () => { return _width; }
    this.GetHeight = () => { return _height; }

    this.IsPositionSafe = (x, y) => {
        if (x < 0 || x >= _width) { return false; }
        if (y < 0 || y >= _height) { return false; }
        return true;
    }

    this.SetByIndex = (i, value) => {
        if (i < 0 || i >= totalCells) { return; }
        _cells[i] = value;
    }

    this.SetAt = (x, y, value) => {
        if (!this.IsPositionSafe(x, y)) { return; }
        _cells[x + (y * _width)] = value;
    }

    this.GetAt = (x, y) => {
        if (!this.IsPositionSafe(x, y)) { return; }
        return _cells[x + (y * _width)];
    }

    this.DebugDump = (tileTypes) => {
        console.log(`Int Grid from types: `, tileTypes);
        for (let y = 0; y < _height; ++y) {
            let str = "";
            for (let x = 0; x < _width; ++x) {
                let v = this.GetAt(x, y);
                let type = tileTypes[v];
                if (type === undefined || type === null) {
                    console.log(`Unknown tile type ${v} at ${x}/${y}`);
                }
                str += type.asciChar;
            }
            console.log(`${str}`);
        }
    }
}

function LoadGridFromText(str, tileTypes) {
    let lines = str.split("\n");
    let h = lines.length;
    let w = lines[0].length;
    let total = w * h;
    console.log(`Loading int grid ${w} by ${h}`);
    let noNewLines = lines.join("");
    console.log(`Newlines removed len: ${noNewLines.length}`);
    let grid = new IntGrid(w, h);
    for (let i = 0; i < total; ++i) {
        let ch = noNewLines[i];
        let type = tileTypes.find(x => x.asciChar === ch);
        let val = 0;
        if (type === undefined) {
            console.log(`No type matched asci char ${ch}`);
        }
        else {
            val = type.index;
        }
        grid.SetByIndex(i, val);
    }
    grid.DebugDump(tileTypes);
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

	let painter = {
		currentTypeIndex: 1,
		paintTypes: [ 0, 1, 2 ]
    };
	
	let tileTypes = [
	{
		name: 'path',
		index: 0, // this will be automatically set anyway
		colour: '#55ff55',
		geomType: TILE_GEOM_TYPES.PATH,
		asciChar: ' '
	},
	{
		name: 'solid',
		index: 1,
		colour: '#333333',
		geomType: TILE_GEOM_TYPES.SOLID,
		asciChar: '#'
	},
	{
		name: 'void',
		index: 2,
		colour: '#3333ff',
		geomType: TILE_GEOM_TYPES.VOID,
		asciChar: '.'
	}
	];
	
	for (let i = 0; i < tileTypes.length; ++i) {
		tileTypes[i].index = i;
	}
    
    // 9 cursors to surround central mouse -> grid overlap
    let cursors = [];

    let cameraPos = new V2(0, 0);
    let cameraSpeed = 256;

    console.log(`Start Editor`);
    let w = 800;//640;
    let h = 480;
    let canvas = CreateCanvas(rootDiv, "fireCanvas", w, h, w, h);
	
	let showMenu = true;
	
	let mainMenu = {};

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

    let SetCellType = (box, typeIndex) => {
        if (box.cell.type === typeIndex) {
            console.log(`Cannot replace type ${box.cell.type} with ${typeIndex}`);
            return;
        }
        let t = tileTypes[typeIndex];
        if (t === undefined) {
            console.log(`undefined tile type ${typeIndex}`);
            return;
        }
		console.log(`Set box to ${t.name} (val ${typeIndex} colour ${t.colour})`);
        box.cell.type = t.index;
        box.colour = t.colour;
    }

    let IsGridPositionSafe = (x, y) => {
        if (x < 0 || x >= gridWidth) { return false; }
        if (y < 0 || y >= gridHeight) { return false; }
        return true;
    }
	
	let ToggleShowMenu = () => {
		showMenu = !showMenu;
		mainMenu.menu1.hidden = !showMenu;
		mainMenu.menu2.hidden = !showMenu;
		mainMenu.menu3.hidden = !showMenu;
	}
	
	let GetPaintType = () => {
		return painter.paintTypes[painter.currentTypeIndex];
    }
    
    let SetCursorPos = (ent, gridX, gridY) => {
        if (IsGridPositionSafe(gridX, gridY) === false) { return; }
        let x = (gridX * pix2Metre) + halfPix2Metre;
        let y = (gridY * pix2Metre) + halfPix2Metre;
        ent.pos.x = x;
	    ent.pos.y = y;
    }

    /////////////////////////////////////////////////////
    // Tick
    /////////////////////////////////////////////////////
    let WorldTickCallback = (gs, input, deltaTime) => {
        // Hack to make repeated keys not jam
        //if (gs.GetActions().IsAnyKeyOn()) {
            gs.dirty = true;
        //}
        let cursorWorldX = gs.cursorPos.x + gs.GetCamera().minX;
        let cursorWorldY = gs.cursorPos.y + gs.GetCamera().minY;
        let gridX = Math.floor(cursorWorldX / pix2Metre);
        let gridY = Math.floor(cursorWorldY / pix2Metre);
        for (let i = 0; i < cursors.length; ++i) {
            let cursor = cursors[i];
            SetCursorPos(
				cursor,
				gridX + cursor.gridOffsetX,
				gridY + cursor.gridOffsetY);
        }
        
        if (gs.GetActions().GetActionValue("1") === 1) {
            //console.log(`Foo`);
        }
        if (gs.GetActionToggledOff("save")) {
            console.log(`Print Level`);
            console.log(WriteGridToStr(gridEntities, gridWidth, gridHeight, tileTypes));
        }
		if (gs.GetActionToggledOff("toggle_menu")) {
            //console.log(`Toggle show menu`);
            ToggleShowMenu();
        }
		if (gs.GetActionToggledOff("next_paint")) {
            //console.log(`Toggle show menu`);
            painter.currentTypeIndex += 1;
			if (painter.currentTypeIndex >= painter.paintTypes.length) {
				painter.currentTypeIndex = 0;
            }
            let paintValue = painter.paintTypes[painter.currentTypeIndex];  
			let t = tileTypes[painter.currentTypeIndex];
            console.log(`Painting type ${paintValue} (${t.name})`);
        }
		if (gs.GetActionToggledOff("previous_paint")) {
            //console.log(`Toggle show menu`);
			
            painter.currentTypeIndex -= 1;
			if (painter.currentTypeIndex < 0) {
				painter.currentTypeIndex = painter.paintTypes.length - 1;
			}
			let paintValue = painter.paintTypes[painter.currentTypeIndex];
			let t = tileTypes[painter.currentTypeIndex];
            console.log(`Painting type ${paintValue} (${t.name})`);
        }
        if (gs.GetActionValue("paint") == 1) {
            if (IsGridPositionSafe(gridX, gridY)) {
                let index = gridX + (gridY * gridWidth);
                let ent = gridEntities[index];
                SetCellType(ent, GetPaintType());
            }
        }
        if (gs.GetActionValue("copy_paint_type") == 1) {
            if (IsGridPositionSafe(gridX, gridY)) {
                let index = gridX + (gridY * gridWidth);
                let ent = gridEntities[index];
                painter.currentTypeIndex = ent.cell.type;
                let t = tileTypes[painter.currentTypeIndex];
                console.log(`Painting type ${paintValue} (${t.name})`);
            }
        }
        let cameraDirty = false;
        if (gs.GetActionValue("camera_left") === 1) {
            cameraPos.x -= cameraSpeed * deltaTime;
            cameraDirty = true;
        }
        if (gs.GetActionValue("camera_right") === 1) {
            cameraPos.x += cameraSpeed * deltaTime;
            cameraDirty = true;
        }
        if (gs.GetActionValue("camera_up") === 1) {
            cameraPos.y -= cameraSpeed * deltaTime;
            cameraDirty = true;
        }
        if (gs.GetActionValue("camera_down") === 1) {
            cameraPos.y += cameraSpeed * deltaTime;
            cameraDirty = true;
        }
        
        if (cameraDirty) {
            gs.SetCameraWorldCentre(cameraPos.x, cameraPos.y);
        }
    }
    
    /////////////////////////////////////////////////////
    // Init world
    /////////////////////////////////////////////////////
    world = new CanvasScene(canvas, WorldTickCallback);
    world.Start(20);
    cameraPos.x = world.GetCamera().x;
    cameraPos.y = world.GetCamera().y;

    ///////////////////////////////////////////////////////////////
    // Build Grid
    ///////////////////////////////////////////////////////////////
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
            let box = world.AddBox(plotX, plotY, halfPix2Metre, halfPix2Metre, '#333333');
            box.tag = TAG_CELL;
            box.cell = { x: x, y: y, type: 1 };
            gridEntities.push(box);
        }
    }

    this.Destroy = () => {
        rootDiv.innerHTML = "";
    };
	
    console.log(`Created ${gridEntities.length} grid cells`);

    let AddCursor = (gridOffsetX, gridOffsetY) => {
        let cursor = world.AddOutline(0, 0, 8, 8, '#00ffff');
        cursor.gridOffsetX = gridOffsetX;
        cursor.gridOffsetY = gridOffsetY;
        cursors.push(cursor);
        //console.log(`Creator cursor ${gridOffsetX}/${gridOffsetY}`);
    }

    // Create cursors
    //cursor = world.AddOutline(0, 0, 8, 8, '#00ffff');
    //cursorId = cursor.id;
    let cursorGridSize = 3;
    for (let y = -cursorGridSize; y <= cursorGridSize; ++y) {
        for (let x = -cursorGridSize; x <= cursorGridSize; ++x) {
            AddCursor(x, y);
        }
    }
	
    
    // Create UI

    mainMenu.menu1 = world.AddText(w - 48, 16, 96, 32, "Editor", "#ff0000");
    mainMenu.menu2 = world.AddText(w - 48, 48, 96, 32, "1", "#ff0000");
    //menu2.hidden = true;
    mainMenu.menu3 = world.AddText(w - 48, 80, 96, 32, "2", "#ff0000");
    
	
	
    /////////////////////////////////////////////////////
    // Init Input
    /////////////////////////////////////////////////////
    let actions = world.GetActions();
    actions.AddAction("save", KEY_CODES.space);
	actions.AddAction("previous_paint", KEY_CODES.q);
	actions.AddAction("next_paint", KEY_CODES.e);
    actions.AddAction("toggle_menu", KEY_CODES.r);
    actions.AddAction("paint", KEY_CODES.mouse1);
    actions.AddAction("copy_paint_type", KEY_CODES.mouse2);

    actions.AddAction("camera_up", KEY_CODES.w);
    actions.AddAction("camera_down", KEY_CODES.s);
    actions.AddAction("camera_left", KEY_CODES.a);
    actions.AddAction("camera_right", KEY_CODES.d);
    
    actions.AddAction("1", KEY_CODES.num1);
    actions.DebugListActions();

    // load int grid
    let intGrid = LoadGridFromText(editor_level_1_asci, tileTypes);
	
}