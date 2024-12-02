const { EmberClient, EmberClientEvent, LoggingService } = require('node-emberplus');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('host', {
        alias: 'h',
        type: 'string',
        demandOption: true,
        description: 'Lawo MC² host IP address',
    })
    .option('port', {
        alias: 'p',
        type: 'number',
        demandOption: true,
        description: 'Lawo MC² port',
    })
    .option('source', {
        alias: 's',
        type: 'number',
        demandOption: true,
        description: 'Source node to connect',
    })
    .option('target', {
        alias: 't',
        type: 'number',
        demandOption: true,
        description: 'Target node to connect',
    })
    .help()
    .argv;

async function runClient() {
    const { host, port, source, target } = argv;
    const client = new EmberClient({ host, port, logger: new LoggingService(5) });

    client.on(EmberClientEvent.ERROR, e => {
        console.error('Error:', e);
    });

    try {
        await client.connectAsync();
        console.log(`Connected to Lawo MC² console at ${host}:${port}`);

        let matrix = await client.getElementByPathAsync("_4/_1/_0");

        console.log(`Disconnecting source ${source} to target ${target}`);
        await client.matrixDisconnectAsync(matrix, target, [source]);

    } catch (e) {
        console.error('Error:', e.stack);
    } finally {
        await client.disconnectAsync(); // Close the connection
        console.log('Disconnected from Lawo MC² console');
    }
}

runClient();
