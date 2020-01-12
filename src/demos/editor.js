
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

    console.log(`Start Editor`);
    let w = 800;//640;
    let h = 600;//480;
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
            ToggleShowMenu();
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

        if (input.mouseOneClick) {
            let gridX = Math.floor(gs.cursorPos.x / pix2Metre);
            let gridY = Math.floor(gs.cursorPos.y / pix2Metre);
            if (IsGridPositionSafe(gridX, gridY)) {
                let index = gridX + (gridY * gridWidth);
                let ent = gridEntities[index];
                SetCellType(ent, GetPaintType());
            }
        }
    }
    
    
    /////////////////////////////////////////////////////
    // Init world
    /////////////////////////////////////////////////////
    world = new CanvasScene(canvas, WorldTickCallback);
    world.Start(20);

    world.GetActions().AddAction("save", KEY_CODES.space);
	world.GetActions().AddAction("previous_paint", KEY_CODES.q);
	world.GetActions().AddAction("next_paint", KEY_CODES.e);
	world.GetActions().AddAction("toggle_menu", KEY_CODES.r);

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

    mainMenu.menu1 = world.AddText(48, 16, 96, 32, "Editor", "#ff0000");
    mainMenu.menu2 = world.AddText(48, 48, 96, 32, "1", "#ff0000");
    //menu2.hidden = true;
    mainMenu.menu3 = world.AddText(48, 80, 96, 32, "2", "#ff0000");
    
    this.Destroy = () => {
        rootDiv.innerHTML = "";
    };
}