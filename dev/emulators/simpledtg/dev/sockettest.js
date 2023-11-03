const net = require('node:net');

const client = net.createConnection({ port: '3999', host: '127.0.0.1' }, () => {
    console.log('Connected');

    client.write(
        JSON.stringify({
            action: 'test',
            payload: { contents: { a: 'hi1', b: { bee: 'b' } }, foo: 'bar' },
        }),
    );

    setTimeout(() => {
        client.write(
            JSON.stringify({
                action: 'test',
                payload: {
                    contents: { a: 'hi2', b: { bee: 'b' } },
                    foo: 'bar',
                },
            }),
        );
    }, 3000);

    setTimeout(() => {
        client.write(
            JSON.stringify({
                action: 'test',
                payload: {
                    contents: { a: 'hi3', b: { bee: 'b' } },
                    foo: 'bar',
                },
            }),
        );
    }, 5000);

    setTimeout(() => {
        client.write(
            JSON.stringify({
                action: 'close',
            }),
        );
    }, 7000);

    setTimeout(() => {
        client.end();
    }, 12000);
});

client.on('data', (data) => {
    console.log(data.toString());
});

client.on('end', () => {
    console.log('Disconnected');
});

client.on('error', (err) => console.log(err));
