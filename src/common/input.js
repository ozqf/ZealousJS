

let KEY_CODES = {
    space: 32
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
        console.log(`Added action ${name} keyCode ${keyCode}`);
        actionKeys.push(name);
    }

    this.ReadKey = (keyCode, value, frameNumber) => {
        let len = actionKeys.length;
        for (let i = 0; i < len; ++i) {
            let action = actions[actionKeys[i]];
            if (action.keyCode === keyCode) {
                if (action.value !== value) {
                    console.log(`Action ${action.name} changed to ${value}`);
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
        console.log(`Check toggled frame ${frame} vs ${action.lastChangeFrame} and value ${action.value}`);
        if (action.lastChangeFrame === frame && action.value === 0)
        { return true; }
        return false;
    }
}
