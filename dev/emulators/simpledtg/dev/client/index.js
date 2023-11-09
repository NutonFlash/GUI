let dtg;

const inputs = {
    engineOn: {
        id: 'engine_on',
        event: 'onclick',
        handler: () => {
            engineHandler(true);
        },
    },
    engineOff: {
        id: 'engine_off',
        event: 'onclick',
        handler: () => {
            engineHandler(false);
        },
    },
    steerDeg: {
        id: 'steer_input',
        event: 'onchange',
        handler: (el) => {
            let deg = el.value;

            deg = Math.max(Math.min(deg, 359), 0);

            el.value = deg;
        },
    },
    steerBtn: {
        id: 'steer_btn',
        event: 'onclick',
        handler: () => {
            steerHandler(document.getElementById(inputs.steerDeg.id).value);
        },
    },
    accelRev: {
        id: 'accel_rev',
        event: 'onclick',
        handler: () => {
            accelHandler('reverse');
        },
    },
    accelNone: {
        id: 'accel_none',
        event: 'onclick',
        handler: () => {
            accelHandler('none');
        },
    },
    accelLow: {
        id: 'accel_low',
        event: 'onclick',
        handler: () => {
            accelHandler('low');
        },
    },
    accelMedium: {
        id: 'accel_med',
        event: 'onclick',
        handler: () => {
            accelHandler('medium');
        },
    },
    accelHigh: {
        id: 'accel_high',
        event: 'onclick',
        handler: () => {
            accelHandler('high');
        },
    },
    brakeLow: {
        id: 'brake_low',
        event: 'onclick',
        handler: () => {
            brakeHandler('low');
        },
    },
    brakeMedium: {
        id: 'brake_med',
        event: 'onclick',
        handler: () => {
            brakeHandler('medium');
        },
    },
    brakeHigh: {
        id: 'brake_high',
        event: 'onclick',
        handler: () => {
            brakeHandler('high');
        },
    },
    connect: {
        id: 'connect',
        event: 'onclick',
        handler: (el) => {
            connectHandler(el);
        },
    },
};

function engineHandler(on) {
    dtg.setEngine(on);
}

function steerHandler(deg) {
    console.log(deg + ' ' + parseFloat(deg));
    dtg.turn(deg);
}

function accelHandler(accel) {
    dtg.setAccel(accel);
}

function brakeHandler(brake) {
    dtg.setBrake(brake);
}

function connectHandler(el) {
    if (dtg.connected) {
        document.getElementById('connected').innerText = 'Not Connected';
        el.innerText = 'Connect';
        return dtg.end();
    }

    document.getElementById('connected').innerText = 'Connected';
    el.innerText = 'Disconnect';
    dtg.connect();
}

window.onload = () => {
    dtg = new DTG(document.getElementById('display'));

    for (let i in inputs) {
        const handler = inputs[i].handler;
        let id = inputs[i].id;
        const event = inputs[i].event;

        const el = document.getElementById(id);

        el[event] = () => {
            handler(el);
        };
    }

    console.log(inputs);
};
