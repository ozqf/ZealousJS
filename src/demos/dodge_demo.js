
RegisterDemo("Dodge", DodgeDemo);

function DodgeDemo(rootDiv) {
    console.log(`Begin Dodgeball`);
	
    // Constants
    const canvasWidth = 320;
    const canvasHeight = 240;
    const TAG_PLAYER = 1;
    const TAG_OBSTACLE = 2;
	
    // Globals
    let plyr;
    let canvas;
    let world;
	
    // Functions
	let SpawnObstacle = (gs) => {
		let pad = 8;
		let x = RandomRange(gs.boundary.minX + pad, gs.boundary.maxX);
		let y = RandomRange(gs.boundary.minY, gs.boundary.maxY);
        let ent = gs.AddBox(x, y, 4, 4, '#ff0000');
        ent.tag = TAG_OBSTACLE;
        ent.Tick = TickObstacle;
        ent.speed = 1;
        let angle = RandomRadians();
        ent.vel.x = Math.cos(angle) * ent.speed;
        ent.vel.y = Math.sin(angle) * ent.speed;
	};
	
	let BoundsCheckPlayer = (gs, ent) => {
		let b = gs.boundary;
		// Wrap and spawn obstacle when going off screen right
		if (ent.pos.x > b.maxX) {
			// Spawn obstacle
			ent.pos.x = b.minX;
            SpawnObstacle(gs);
            SpawnObstacle(gs);
            SpawnObstacle(gs);
			return;
		}
		// Can't go off screen left
		else if (ent.pos.x < b.minX) {
			ent.pos.x = b.minX;
		}
		Ent_BoundaryWrap(gs.boundary, ent);
    };
    
    let TickPlayer = (gs, ent, deltaTime) => {
        let s = ent.speed;
        let input = gs.GetInput();
        if (input.left) { ent.vel.x = -s, ent.vel.y = 0; }
        else if (input.right) { ent.vel.x = s, ent.vel.y = 0; }
        else if (input.up) { ent.vel.x = 0, ent.vel.y = -s; }
        else if (input.down) { ent.vel.x = 0, ent.vel.y = s; }
        Ent_SimpleMove(gs, ent, deltaTime);
        BoundsCheckPlayer(gs, plyr);
    };
    
    let TickObstacle = (gs, ent, deltaTime) => {
        Ent_SimpleMove(gs, ent, deltaTime);
        Ent_BoundaryBounce(gs.boundary, ent);
    };

    let Tick = (gs, input, deltaTime) => {
        gs.dirty = true;
		TickPlayer(gs, plyr, deltaTime);
        let ents = gs.GetEntities();
        for (let i = ents.length - 1; i >= 0; --i) {
            let ent = ents[i];
            if (ent.Tick !== undefined) { ent.Tick(gs, ent, deltaTime); }
        }
    };
	
    // Init
    canvas = CreateCanvas(
		rootDiv, "dodgeCanvas",
		640, 480,
		canvasWidth, canvasHeight);
    world = new CanvasScene(canvas, Tick);
    world.Start(30);
	
    plyr = world.AddBox(320 / 2, 240 / 2, 4, 4, '#00ff00');
    plyr.tag = TAG_PLAYER;
    plyr.speed = 2;
    plyr.vel.x = plyr.speed;
    
    // Destroy
    this.Destroy = () => {
        world.Destroy();
        rootDiv.innerHTML = "";
    }
}
