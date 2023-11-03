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
    }, 1000);

    setTimeout(() => {
        client.end();
    }, 5000);
});

client.on('data', (data) => {
    console.log(data.toString());
});

client.on('end', () => {
    console.log('Disconnected');
});

client.on('error', (err) => console.log(err));
