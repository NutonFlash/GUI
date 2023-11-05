const net = require('node:net');

const client = net.createConnection({ port: '3999', host: '127.0.0.1' }, () => {
    console.log('Connected');

    setTimeout(() => {
        client.write(
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
        client.write(
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
        client.write(
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
        client.write(
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
        client.write(
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
        client.write(
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
    //     client.write(
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
    //     client.write(
    //         JSON.stringify({
    //             event: 'dtg',
    //             payload: {
    //                 action: 'brake',
    //                 accel: 'high',
    //             },
    //         }),
    //     );
    // }, 5200);

    // setTimeout(() => {
    //     client.write(
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
        client.write(
            JSON.stringify({
                event: 'dtg',
                payload: {
                    action: 'end',
                },
            }),
        );
    }, 25000);

    setTimeout(() => {
        client.end();
    }, 26000);
});

client.on('data', (data) => {
    console.log(JSON.parse(data.toString()));
});

client.on('end', () => {
    console.log('Disconnected');
});

client.on('error', (err) => console.log(err));
