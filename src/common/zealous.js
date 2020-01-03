/*
Canvas scene and primitives for prototyping
*/
"use strict";

///////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS
///////////////////////////////////////////////////////////////////
function RandomRange(min, max) {
	return (Math.random() * (max - min) + min);
}

function RandomRadians() {
	return Math.random() * (2 * Math.PI);
}

function Ent_SimpleMove(gs, ent, deltaTime) {
	ent.pos.x += (ent.vel.x * gs.pix2metre) * deltaTime;
	ent.pos.y += (ent.vel.y * gs.pix2metre) * deltaTime;
}

function Ent_BoundaryBounce(boundary, ent) {
	let vel = ent.vel;
	if (ent.pos.x > boundary.maxX)
	{ ent.pos.x = boundary.maxX; vel.x = -vel.x; }
	if (ent.pos.x < boundary.minX)
	{ ent.pos.x = boundary.minX; vel.x = -vel.x; }
	if (ent.pos.y > boundary.maxY)
	{ ent.pos.y = boundary.maxY; vel.y = -vel.y; }
	if (ent.pos.y < boundary.minY)
	{ ent.pos.y = boundary.minY; vel.y = -vel.y; }
}

function Ent_BoundaryWrap(boundary, ent) {
	if (ent.pos.x > boundary.maxX) { ent.pos.x = boundary.minX; }
	if (ent.pos.x < boundary.minX) { ent.pos.x = boundary.maxX; }
	if (ent.pos.y > boundary.maxY) { ent.pos.y = boundary.minY; }
	if (ent.pos.y < boundary.minY) { ent.pos.y = boundary.maxY; }
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
		return Math.atan2(this.y, this.x);
	};
	this.Mag = function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
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
	obj.externalId = null;
	obj.pos = new V2(x, y);
	obj.vel = new V2(0, 0);
	obj.speed = 0;
}

function GenericCtor(
	id, newX, newY, newColour) {
	ZqfInitShapeBase(this, id, 0, 0, newX, newY);
	let aabb = { 
		minX: this.pos.x,
		minY: this.pos.y,
		maxX: this.pos.x,
		maxY: this.pos.y
	};
	this.colour = newColour;
	this.Draw = function(ctx, camera) { };
	this.ToAABB = function() {
		return aabb;
	};
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
	this.ToAABB = function() {
		return {
			minX: this.pos.x - this.halfWidth,
			minY: this.pos.y - this.halfHeight,
			maxX: this.pos.x + this.halfWidth,
			maxY: this.pos.y + this.halfHeight
		};
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
	this.ToAABB = function() {
		return {
			minX: this.pos.x - this.radius,
			minY: this.pos.y - this.radius,
			maxX: this.pos.x + this.radius,
			maxY: this.pos.y + this.radius
		};
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
	this.ToAABB = function() {
		return {
			minX: this.pos.x - this.halfWidth,
			minY: this.pos.y - this.halfHeight,
			maxX: this.pos.x + this.halfWidth,
			maxY: this.pos.y + this.halfHeight
		};
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
		ctx.lineWidth = 1;
		ctx.moveTo(this.a.x, this.a.y);
		ctx.lineTo(this.b.x, this.b.y);
		ctx.stroke();
	};
	this.ToAABB = function() {
		return {
			minX: Math.min(this.a.x, this.b.x),
			minY: Math.min(this.a.y, this.b.y),
			maxX: Math.max(this.a.x, this.b.x),
			maxY: Math.max(this.a.y, this.b.y)
		};
	};
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// MASTER GAME CONSTRUCTOR
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
function CanvasScene(canvas, PreTickCallback) {
	// Closure - private GameState  vars
    //let canvas = document.getElementById(canvasElementId);
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
	
	ctx.fillStyle = "#000000ff	";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	let shapes = [];
	let input = {
		mouseOneClick: false,
		mouseTwoClick: false,
		left: false,
		right: false
	};


	// PRIVATE
	let tick = 0;
	let radians = 0;
    let rate = 5 * this.deg2rad;
	
	// PUBLIC
	this.dirty = true;
	this.timeScale = 1;
    this.deg2rad = 3.141593 / 180;
    this.rad2deg = 57.2958;
    
	let nextEntityId = 1;
	
	this.pix2metre = 32;

	this.cursorPos = new V2(0, 0);

	// This marks out the play area boundary
	// Set to size of canvas by default but can be overridden
	this.boundary = {
		minX: 0,
		minY: 0,
		maxX: canvas.width,
		maxY: canvas.height
	};
	
	////////////////////////////////////////////////////////////
	// Get services
	////////////////////////////////////////////////////////////
	
	this.GetInput = () => { return input; };
	this.GetCamera = () => { return camera; };

	////////////////////////////////////////////////////////////
	// Entity Creation
	////////////////////////////////////////////////////////////
	
	this.AddGeneric = function(x0, y0, x1, y1, colour) {
		let obj = new GenericCtor(
			nextEntityId++, x, y, colour);
		shapes.push(obj);
		return obj;
	};
	
	this.AddBox = function(x, y, halfWidth, halfHeight, colour) {
		let box = new BoxCtor(
			nextEntityId++, x, y, halfWidth, halfHeight, colour);
		shapes.push(box);
		return box;
	};

	this.AddOutline = function(x, y, halfWidth, halfHeight, colour) {
		let outline = new OutlineCtor(
			nextEntityId++, x, y, halfWidth, halfHeight, colour);
		shapes.push(outline);
		return outline;
	};

	this.AddCircle	= function(x, y, radius, colour) {
		let circle = new CircleCtor(
			nextEntityId++, x, y, radius, colour);
		shapes.push(circle);
		return circle;
	};

	this.AddLine = function(x0, y0, x1, y1, colour) {
		let line = new LineCtor(
			nextEntityId++, x0, y0, x1, y1, colour);
		shapes.push(line);
		return line;
	};
	
	////////////////////////////////////////////////////////////
	// Entity removal
	////////////////////////////////////////////////////////////
	this.RemoveAll = () => { shapes = []; };
	this.RemoveById = (id) => {
		for (let i = shapes.length - 1; i >= 0; --i) {
			if (shapes[i].id !== id) { continue; }
			shapes.splice(i, 1);
			return true;
		}
		return false;
	};
	this.RemoveAllByTag = (tag) => {
		let count = 0;
		for (let i = shapes.length - 1; i >= 0; --i) {
			if (shapes[i].tag !== tag) { continue; }
			shapes.splice(i, 1);
			count++;
		}
		return count;
	};
	
	///////////////////////////////////////////////////////////////////
	// Frame cycle
	///////////////////////////////////////////////////////////////////
	this.StepShapes = (list, deltaTime) => {
		for (let i = list.length - 1; i >= 0; --i) {
			let shape = list[i];
			shape.pos.x += shape.vel.x * deltaTime;
			shape.pos.y += shape.vel.y * deltaTime;
			// Wrap:
			//if (shape.pos.x > canvas.width) { shape.pos.x = 0; }
			//if (shape.pos.x < 0) { shape.pos.x = canvas.width; }
			//if (shape.pos.y > canvas.height) { shape.pos.y = 0; }
			//if (shape.pos.y < 0) { shape.pos.y = canvas.height; }
			// Bounce:
			let vel = shape.vel;
			if (shape.pos.x > canvas.width)
			{ shape.pos.x = canvas.width; vel.x = -vel.x; }
			if (shape.pos.x < 0)
			{ shape.pos.x = 0; vel.x = -vel.x; }
			if (shape.pos.y > canvas.height)
			{ shape.pos.y = canvas.height; vel.y = -vel.y; }
			if (shape.pos.y < 0)
			{ shape.pos.y = 0; vel.y = -vel.y; }
		}
	};

    this.Tick = (deltaTime) => {
		if (!this.dirty) { return; }
		this.dirty = false;
		if (PreTickCallback) {
			PreTickCallback(this, input, deltaTime);
		}
		
		this.Draw();
		// Clear single frame events
		input.mouseOneClick = false;
		input.mouseTwoClick = false;
        tick++;
	};
	
    this.Draw = function() {
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		//ctx.fillStyle = "#222222";
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		camera.halfWidth = canvas.width * 0.5;
		camera.halfHeight = canvas.height * 0.5;
		camera.minX = camera.x - camera.halfWidth;
		camera.minY = camera.y - camera.halfHeight;
		shapes.sort((a, b) => {
			return b.depth - a.depth;
		});
		for (let i = 0; i < shapes.length; ++i) {
			let obj = shapes[i];
			if (obj.Draw !== null) {
				obj.Draw(ctx, camera);
			}
		}
	};

	this.CreateGrid = (depth) => {
		let minX = 0;
		let minY = 0;
		let maxX = canvas.width;
		let maxY = canvas.height;
		let x = 0;
		let colour = "#0000ff";
		while (x <= maxX) {
			let line = this.AddLine(x, minY, x, maxY, colour);
			line.depth = depth;
			x += this.pix2metre;
		}
		let y = 0;
		while (y <= maxY) {
			let line = this.AddLine(minX, y, maxX, y, colour);
			line.depth = depth;
			y += this.pix2metre;
		}
	};
	
	///////////////////////////////////////////////////////////////////
	// Entity Search
	///////////////////////////////////////////////////////////////////
	this.GetEntities = () => { return shapes; };

	this.FindEntById = function(id) {
		let l = shapes.length;
		for (let i = 0; i < l; ++i) {
			if (shapes[i].id === id) { return shapes[i]; }
		} return null;
	};
	
	this.FindEntByExternalId = function(id) {
		let l = shapes.length;
		for (let i = 0; i < l; ++i) {
			if (shapes[i].externalId === id) { return shapes[i]; }
		} return null;
	};
	
	this.FindAllByTag = function(tag) {
		let results = [];
		let l = shapes.length;
		for (let i = 0; i < l; ++i) {
			if (shapes[i].tag !== tag) {continue;}
			results.push(shapes[i]);
		}
		return results;
	};
	
	///////////////////////////////////////////////////////////////////
	// Event handlers
	///////////////////////////////////////////////////////////////////
	this.HandleKeyDown = function(ev) {
		let k = ev.keyCode;
		if (k === keys.left) { input.left = true; return; }
		if (k === keys.right) { input.right = true; return; }
		if (k === keys.up) { input.up = true; return; }
		if (k === keys.down) { input.down = true; return; }
		else { console.log(`Unused keyCode ${ev.keyCode} Down`); }
	};
	
	this.HandleKeyUp = function(ev) {
		let k = ev.keyCode;
		if (k === keys.left) { input.left = false; return; }
		if (k === keys.right) { input.right = false; return; }
		if (k === keys.up) { input.up = false; return; }
		if (k === keys.down) { input.down = false; return; }
		else { console.log(`Unused keyCode ${ev.keyCode} Up`); }
	};
	
	this.HandleMouseMove = (ev) => {
		let rect = canvas.getBoundingClientRect();
		this.cursorPos.x = ev.clientX - rect.left;
		this.cursorPos.y = ev.clientY - rect.top;
		this.dirty = true;
		//return this.cursorPos;
	};

	this.HandleGetFocus = function() {
		console.log(`Get focus`);
	};

	this.HandleLoseFocus = function() {
		console.log(`Lose focus`);
	};

	this.HandleMouseDown = (ev) => {

	};
	
	this.HandleMouseUp = (ev) => {
		
	};

	this.HandleMouseClick = (ev) => {
		input.mouseOneClick = true;
		//console.log(`Mouse click`);
		this.dirty = true;
		return false;
	};

	this.HandleContextMenu = (ev) => {
		input.mouseTwoClick = true;
		this.dirty = true;
		return false;
	};
	
	// Attach input listeners
	// Hack to make canvas element accept keyboard events:
	// https://stackoverflow.com/questions/15631991/how-to-register-onkeydown-event-for-html5-canvas
	canvas.tabIndex = 1;

	canvas.onkeydown = this.HandleKeyDown;
	canvas.onkeyup = this.HandleKeyUp;
	canvas.addEventListener("focusout", this.HandleLoseFocus, true);
	canvas.addEventListener("focusin", this.HandleGetFocus, true);
	canvas.addEventListener("mousemove", this.HandleMouseMove, true);
	canvas.addEventListener("click", this.HandleMouseClick, true);
	canvas.addEventListener("contextmenu", this.HandleContextMenu, true);
	
	this.Destroy = () => {
		console.log(`Destroy scene`);
		clearInterval(intervalHandle);
		canvas.removeEventListener("focusout", this.HandleLoseFocus);
		canvas.removeEventListener("focusin", this.HandleGetFocus);
		canvas.removeEventListener("mousemove", this.HandleMouseMove);
		canvas.removeEventListener("click", this.HandleMouseClick);
		canvas.removeEventListener("contextmenu", this.HandleContextMenu);
		
	};
	let intervalHandle;
	///////////////////////////////////////////////////////////////////
	// Startup
	///////////////////////////////////////////////////////////////////
    this.Start = function(fps) {
		console.log(`Start scene refresh, target fps ${fps}`);
		// DT is in seconds, interval has to be milliseconds
		let deltaTime = 1 / fps;
		let interval = 1000 / fps;
        intervalHandle = setInterval(() => {
			this.Tick(deltaTime * this.timeScale);
		}, interval);
	}
}
