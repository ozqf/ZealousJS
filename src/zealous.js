/*
Canvas scene and primitives for prototyping
*/
"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////
function RandomRange(min, max) {
	return (Math.random() * (max - min) + min);
}

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// TYPE CONSTRUCTORS
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
function V2(newX, newY) {
	this.x = newX;
	this.y = newY;
	this.Radians = function() {
		return Math.atan2(y, x);
	};
	this.Mag = function() {
		return Math.sqrt((x * x) + (y * y));
	};
}

// Not sure how to format AABB (pos + size vs min/max vectors)
/*function AABB(newX, newY, width, height) {
	this.x = newX;
	this.y = newY;
	this.width = width;
	this.height = height;
}*/

function ZqfInitShapeBase(obj, id, tag, depth, x, y) {
	obj.id = id;
	obj.tag = tag;
	obj.depth = depth;
	obj.pos = new V2(x, y);
}

// Primitive constructors:
function BoxCtor(
	id, newX, newY, newHalfWidth, newHalfHeight, newColour) {
	ZqfInitShapeBase(this, id, 0, 0, newX, newY);
	
	this.halfWidth = newHalfWidth;
	this.halfHeight = newHalfHeight;
	this.colour = newColour;
	this.Draw = function(ctx, camera) {
		
		ctx.fillStyle = this.colour;
		let minX = (this.pos.x - this.halfWidth) - camera.minX;
		let minY = (this.pos.y - this.halfHeight) - camera.minY;
		ctx.fillRect(minX, minY,
			(this.halfWidth * 2), (this.halfHeight * 2));
	};
}

function CircleCtor(id, newX, newY, radius, newColour) {
	ZqfInitShapeBase(this, id, 0, 0, newX, newY);
	this.radius = radius;
	this.colour = newColour;
	this.Draw = function(ctx, camera) {
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.beginPath();
		ctx.arc(this.pos.x - camera.minX, this.pos.y - camera.minY, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
	};
}

function OutlineCtor(id, newX, newY, newHalfWidth, newHalfHeight, newColour) {
	ZqfInitShapeBase(this, id, 0, 0, newX, newY);
	this.pos = new V2(newX, newY);
	this.halfWidth = newHalfWidth;
	this.halfHeight = newHalfHeight;
	this.colour = newColour;
	this.Draw = function(ctx, camera) {
		
		//ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		let minX = (this.pos.x - this.halfWidth) - camera.minX;
		let minY = (this.pos.y - this.halfHeight) - camera.minY;
		ctx.strokeRect(minX, minY,
			(this.halfWidth * 2), (this.halfHeight * 2));
	};
}

function LineCtor(id, startX, startY, endX, endY, colour) {
	ZqfInitShapeBase(this, id, 0, 0, 0, 0);
	this.a = new V2(startX, startY);
	this.b = new V2(endX, endY);
	this.colour = colour;
	this.Draw = function(ctx, camera) {
		ctx.beginPath();
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = 2;
		ctx.moveTo(this.a.x, this.a.y);
		ctx.lineTo(this.b.x, this.b.y);
		ctx.stroke();
	};
}





////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// MASTER GAME CONSTRUCTOR
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
function CreateEngineInstance(canvasElementId, preTickCallback) {
    console.log("Init Scene");
	// Closure - private GameState  vars
    let canvas = document.getElementById(canvasElementId);
	let ctx = canvas.getContext("2d");

	let keys = {
		left: 37,
		right: 39, 
		up: 38,
		down: 40,
		w: 87,
		a: 65,
		s: 83,
		d: 68
	};
	
	// Update camera width/height at render time
	let camera = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		// keep this updated if diff changes...?
		halfWidth: canvas.width / 2,
		halfHeight: canvas.height / 2,
		// top left for sprite translation to camera space
		minX: 0,
		minY: 0
	};
	
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	let PreTickCallback = preTickCallback;
	let shapes = [];
	let input = {
		left: false,
		right: false
	};
	let tick = 0;
	
	this.dirty = true;
    this.deg2rad = 3.141593 / 180;
    this.rad2deg = 57.2958;
    let radians = 0;
    let rate = 5 * this.deg2rad;
	let nextEntityId = 1;
	
	this.pix2metre = 32;

	this.playerId = 0;
	
	this.cursorPos = new V2(0, 0);
	
	////////////////////////////////////////////////////////////
	// Entity Creation
	////////////////////////////////////////////////////////////
	this.AddBox = function(x, y, halfWidth, halfHeight, colour) {
		console.log(`{ x: ${x}, y: ${y}, hw: ${halfWidth}, hh: ${halfHeight} }`);
		let box = new BoxCtor(
			nextEntityId++, x, y, halfWidth, halfHeight, colour);
		shapes.push(box);
		return box;
	}

	this.AddOutline = function(x, y, halfWidth, halfHeight, colour) {
		let outline = new OutlineCtor(
			nextEntityId++, x, y, halfWidth, halfHeight, colour);
		shapes.push(outline);
		return outline;
	}

	this.AddCircle	= function(x, y, radius, colour) {
		let line = new CircleCtor(
			nextEntityId++, x, y, radius, colour);
		shapes.push(line);
		return line;
	}

	this.AddLine = function(x0, y0, x1, y1, colour) {
		let line = new LineCtor(
			nextEntityId++, x0, y0, x1, y1, colour);
		shapes.push(line);
		return line;
	}
	
	////////////////////////////////////////////////////////////
	// Entity removal
	////////////////////////////////////////////////////////////
	this.RemoveAll = () => { shapes = []; }
	this.RemoveAllByTag = (tag) => {
		let count = 0;
		for (let i = shapes.length - 1; i >= 0; --i) {
			if (shapes[i].tag !== tag) { continue; }
			shapes.splice(i, 1);
			count++;
		}
		return count;
	}
	
	
	this.UpdatePlayer = function(id, deltaTime) {
		if (id === 0) { return; }
		let avatar = this.FindEntById(id);
		if (avatar === null) {
			console.log(`No player avatar ${id}!`);
			return;
		}
		let speed = 10;
		if (input.left) { avatar.pos.x -= (speed * this.pix2metre) * deltaTime; }
		if (input.right) { avatar.pos.x += (speed * this.pix2metre) * deltaTime; }
		if (input.up) { avatar.pos.y -= (speed * this.pix2metre) * deltaTime; }
		if (input.down) { avatar.pos.y += (speed * this.pix2metre) * deltaTime; }
	}
	
	///////////////////////////////////////////////////////////////////
	// Frame cycle
	///////////////////////////////////////////////////////////////////
    this.Tick = (deltaTime) => {
		if (!this.dirty) { return; }
		this.dirty = false;
		if (PreTickCallback) {
			PreTickCallback(this, deltaTime);
		}
		
		this.UpdatePlayer(this.playerId, deltaTime);
		this.Draw();
        tick++;
    }
	
    this.Draw = function() {
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#222222";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		camera.halfWidth = canvas.width * 0.5;
		camera.halfHeight = canvas.height * 0.5;
		camera.minX = camera.x - camera.halfWidth;
		camera.minY = camera.y - camera.halfHeight;
		
		for (let i = 0; i < shapes.length; ++i) {
			let obj = shapes[i];
			obj.Draw(ctx, camera);
		}
	}

	this.CreateGrid = () => {
		let minX = 0;
		let minY = 0;
		let maxX = canvas.width;
		let maxY = canvas.height;
		let x = 0;
		let colour = "#0000ff";
		while (x <= maxX) {
			this.AddLine(x, minY, x, maxY, colour);
			x += this.pix2metre;
		}
		let y = 0;
		while (y <= maxY) {
			this.AddLine(minX, y, maxX, y, colour);
			y += this.pix2metre;
		}
	}
	
	///////////////////////////////////////////////////////////////////
	// Entity Search
	///////////////////////////////////////////////////////////////////
	this.FindEntById = function(id) {
		let l = shapes.length;
		for (let i = 0; i < l; ++i) {
			if (shapes[i].id === id) { return shapes[i]; }
		} return null;
	}
	
	this.FindAllByTag = function(tag) {
		let results = [];
		let l = shapes.length;
		for (let i = 0; i < l; ++i) {
			if (shapes[i].tag !== tag) {continue;}
			results.push(shapes[i]);
		}
		return results;
	}
	
	///////////////////////////////////////////////////////////////////
	// Event handlers
	///////////////////////////////////////////////////////////////////
	this.HandleKeyDown = function(ev) {
		//console.log(`Key ${ev.keyCode} down`);
		let k = ev.keyCode;
		if (k === keys.left) { input.left = true; return; }
		if (k === keys.right) { input.right = true; return; }
		if (k === keys.up) { input.up = true; return; }
		if (k === keys.down) { input.down = true; return; }
	}
	
	this.HandleKeyUp = function(ev) {
		//console.log(`Key ${ev.keyCode} up`);
		let k = ev.keyCode;
		if (k === keys.left) { input.left = false; return; }
		if (k === keys.right) { input.right = false; return; }
		if (k === keys.up) { input.up = false; return; }
		if (k === keys.down) { input.down = false; return; }
	}
	
	this.HandleMouseMove = (ev) => {
		let rect = canvas.getBoundingClientRect();
		this.cursorPos.x = ev.clientX - rect.left;
		this.cursorPos.y = ev.clientY - rect.top;
		//return this.cursorPos;
	}

	this.HandleGetFocus = function() {
		console.log(`Get focus`);
	}

	this.HandleLoseFocus = function() {
		console.log(`Lose focus`);
	}
	
	// Attach input listeners
	// Hack to make canvas element accept keyboard events:
	// https://stackoverflow.com/questions/15631991/how-to-register-onkeydown-event-for-html5-canvas
	canvas.tabIndex = 1;

	canvas.onkeydown = this.HandleKeyDown;
	canvas.onkeyup = this.HandleKeyUp;
	canvas.addEventListener("focusout", this.HandleLoseFocus, true);
	canvas.addEventListener("focusin", this.HandleGetFocus, true);
	canvas.addEventListener("mousemove", this.HandleMouseMove, true);
	
	///////////////////////////////////////////////////////////////////
	// Startup
	///////////////////////////////////////////////////////////////////
    this.Start = function(fps) {
		console.log(`Start scene refresh, target fps ${fps}`);
		// DT is in seconds, interval has to be milliseconds
		let deltaTime = 1 / fps;
		let interval = 1000 / fps;
        setInterval(() => { this.Tick(deltaTime) }, interval);
	}
}
