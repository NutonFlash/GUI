class DTG {
    constructor() {
        this.data = {};
        this.connected = false;
        this.socket = null;
        this.NORMAL_SPEED = 45;
    }

    setEngine(on) {
        this.socket.send(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'engine',
                    on: on,
                },
            }),
        );
    }

    setAccel(accel) {
        this.socket.send(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'accelerate',
                    accel: accel,
                },
            }),
        );
    }

    setBrake(brake) {
        this.socket.send(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'brake',
                    brake: brake,
                },
            }),
        );
    }

    turn(deg) {
        this.socket.send(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'turn',
                    deg: parseInt(deg) + '',
                },
            }),
        );
    }

    end() {
        this.connected = false;
        this.socket.send(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'end',
                },
            }),
        );
    }

    bind(id, displayFunc) {
        this.socket = new WebSocket('ws://localhost:3999/dtg');

        this.socket.addEventListener('open', () => {
            this.connected = true;
            console.log('DTG Connected');

            setTimeout(() => {
                this.socket.send(
                    JSON.stringify({
                        event: 'dtg',
                        payload: {
                            action: 'bind',
                            id: id,
                        },
                    }),
                );
            }, 100);
        });

        this.socket.addEventListener('message', (evt) => {
            this.data = JSON.parse(evt.data);
            displayFunc(this.data);
        });

        this.socket.addEventListener('close', () => {
            console.log('DTG Disconnected');
        });
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:3999/dtg');

        this.socket.addEventListener('open', () => {
            this.connected = true;
            console.log('DTG Connected');

            setTimeout(() => {
                this.socket.send(
                    JSON.stringify({
                        event: 'dtg',
                        payload: {
                            action: 'init',
                            data: {
                                lat: 36.339712,
                                lng: 127.4445824,
                            },
                        },
                    }),
                );
            }, 100);
        });

        this.socket.addEventListener('message', (evt) => {
            this.data = JSON.parse(evt.data);
        });

        this.socket.addEventListener('close', () => {
            this.data = { message: 'Disconnected' };
            console.log('socket closed');
        });
    }
}
