

let KEY_CODES = {
    mouseX: -1,
    mouseY: -2,
    mouse1: -3,
    mouse2: -4,

    space: 32,
	leftShift: 16,
	leftControl: 17,
	enter: 13,
	backspace: 8,
	up: 38,
	down: 83,
	left: 65,
	right: 68,
	
	q: 81,
	e: 69,
	r: 82,
	f: 70,
	w: 87,
	a: 65,
	s: 83,
	d: 68,
	z: 90,
	x: 88,
	c: 67,
    v: 86,
    
    num0: 48,
    num1: 49,
    num2: 50,
    num3: 51,
    num4: 52,
    num5: 53,
    num6: 54,
    num7: 55,
    num8: 56,
    num9: 57
};

function InputActions() {
    console.log(`Input input action list`);
    let ready = false;
    let actions = {};
    let actionKeys = [];

    this.AddAction = (name, keyCode) => {
        let action = {
            value: 0,
            name: name,
            keyCode: keyCode,
            lastChangeFrame: 0
        };
        actions[name] = action;
        //console.log(`Added action ${name} keyCode ${keyCode}`);
        actionKeys.push(name);
    }

    // Only checks keys, not mouse
    this.IsAnyKeyOn = () => {
        let len = actionKeys.length;
        for (let i = 0; i < len; ++i) {
            let action = actions[actionKeys[i]];
            if (action.keyCode > 0 && action.value > 0) {
                return true;
            }
        }
        return false;
    }

    this.ReadKey = (keyCode, value, frameNumber) => {
        let len = actionKeys.length;
        for (let i = 0; i < len; ++i) {
            let action = actions[actionKeys[i]];
            if (action.keyCode === keyCode) {
                if (action.value !== value) {
                    //console.log(`Action ${action.name} changed to ${value}`);
                    action.value = value;
                    action.lastChangeFrame = frameNumber;
                }
                return;
            }
        }
    }

    this.GetActionValue = (name) => {
        let action = actions[name];
        if (action === undefined) {
            console.log(`no action ${name}`);
            return 0;
        }
        //console.log(`action ${name} value -- ${action.value}`);
        return action.value;
    }

    this.GetActionToggleOff = (name, frame) => {
        if (frame === undefined) { console.log(`Frame undefined`); return false; }
        let action = actions[name];
        if (action === undefined) { return false; }
        //console.log(`Check toggled frame ${frame} vs ${action.lastChangeFrame} and value ${action.value}`);
        if (action.lastChangeFrame === frame && action.value === 0)
        { return true; }
        return false;
    }

    this.DebugListActions = () => {
        let len = actionKeys.length;
        for (let i = 0; i < len; ++i) {
            let key = actionKeys[i];
            let action = actions[key];
            console.log(`Action ${action.name} code ${action.keyCode}`)
        }
    }
}
