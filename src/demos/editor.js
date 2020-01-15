
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

function LoadGridFromText(gridEnts, w, h, str) {
	
}

function Editor_CreateGrid(game, newWidth, newHeight) {
	let grid = {
		width: newWidth,
		height: newHeight,
		ents: [],
		displayEnts: []
	};
	let totalCells = newWidth * newHeight;
	for(let i = 0; i < totalCells; ++i) {
		
	}
	return grid;
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
		paintTypes: [ 0, 1]
    };
    
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

    let SetCellType = (box, type) => {
        if (box.cell.type === type) { return; }
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
            SetCursorPos(cursor, gridX + cursor.gridOffsetX, gridY + cursor.gridOffsetY);
        }
        
        if (gs.GetActions().GetActionValue("1") === 1) {
            //console.log(`Foo`);
        }
        if (gs.GetActionToggledOff("save")) {
            console.log(`Print Level`);
            console.log(WriteGridToStr(gridEntities, gridWidth, gridHeight));
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
            console.log(`Painting type ${paintValue}`);
        }
		if (gs.GetActionToggledOff("previous_paint")) {
            //console.log(`Toggle show menu`);
			
            painter.currentTypeIndex -= 1;
			if (painter.currentTypeIndex < 0) {
				painter.currentTypeIndex = painter.paintTypes.length - 1;
			}
			let paintValue = painter.paintTypes[painter.currentTypeIndex];
			console.log(`Painting type ${paintValue}`);
        }
        if (gs.GetActionValue("paint") == 1) {
            console.log(`Paint`);
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
            box.cell = { x: x, y: y, type: 0 };
            gridEntities.push(box);
        }
    }
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
    for (let y = -2; y <= 2; ++y) {
        for (let x = -2; x <= 2; ++x) {
            AddCursor(x, y);
        }
    }
    
    // Create UI

    mainMenu.menu1 = world.AddText(w - 48, 16, 96, 32, "Editor", "#ff0000");
    mainMenu.menu2 = world.AddText(w - 48, 48, 96, 32, "1", "#ff0000");
    //menu2.hidden = true;
    mainMenu.menu3 = world.AddText(w - 48, 80, 96, 32, "2", "#ff0000");
    
    this.Destroy = () => {
        rootDiv.innerHTML = "";
    };
}