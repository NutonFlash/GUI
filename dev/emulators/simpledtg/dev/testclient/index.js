window.onload = () => {
    let socket = new WebSocket('ws://localhost:3999/dtg');
    socket.addEventListener('open', () => {
        console.log('Socket opened');

        setTimeout(() => {
            socket.send(
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

        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'engine',
                        on: true,
                    },
                }),
            );
        }, 980);

        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'accelerate',
                        accel: 'low',
                    },
                }),
            );
        }, 1000);
        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'accelerate',
                        accel: 'medium',
                    },
                }),
            );
        }, 1100);
        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'accelerate',
                        accel: 'high',
                    },
                }),
            );
        }, 1200);
        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'turn',
                        deg: 90,
                    },
                }),
            );
        }, 4500);

        // setTimeout(() => {
        //     socket.send(
        //         JSON.stringify({
        //             event: 'dtg',
        //             payload: {
        //                 action: 'turn',
        //                 deg: 45_00,
        //             },
        //         }),
        //     );
        // }, 4200);

        // setTimeout(() => {
        //     socket.send(
        //         JSON.stringify({
        //             event: 'dtg',
        //             payload: {
        //                 action: 'brake',
        //                 brake: 'high',
        //             },
        //         }),
        //     );
        // }, 5200);

        // setTimeout(() => {
        //     socket.send(
        //         JSON.stringify({
        //             event: 'dtg',
        //             payload: {
        //                 action: 'engine',
        //                 on: false,
        //             },
        //         }),
        //     );
        // }, 8900);

        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'dtg',
                    payload: {
                        action: 'end',
                    },
                }),
            );
        }, 60000);
    });
    socket.addEventListener('message', (evt) => {
        console.log(evt.data);
    });
    socket.addEventListener('close', () => {
        console.log('socket closed');
    });
};
