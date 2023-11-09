class DTG {
    constructor(display) {
        this.data = {};
        this.connected = false;
        this.socket = null;
        this.display = display;
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
                    deg: deg,
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

    connect() {
        let io = window.location.hostname;
        this.socket = new WebSocket(
            `ws://${window.location.hostname}:3999/dtg`,
        );

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
            this.display.innerText = JSON.stringify(this.data, null, 4);
        });

        this.socket.addEventListener('close', () => {
            console.log('socket closed');
        });
    }
}
