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
    const { host, port, source, target } = argv;  // Use command-line arguments for host, port, source, and target
    const client = new EmberClient({ host, port, logger: new LoggingService(5) });

    client.on(EmberClientEvent.ERROR, e => {
        console.error('Error:', e);
    });

    try {
        await client.connectAsync();
        console.log(`Connected to Lawo MC² console at ${host}:${port}`);

        await client.getDirectoryAsync();
        let matrix = await client.getElementByPathAsync("_4/_1/_0"); // Check if this the Audio Martix of your console, it was for both of mine, so it might be a global destination...

        console.log(`Connecting source ${source} to target ${target}`);
        await client.matrixConnectAsync(matrix, target, [source]);

    } catch (e) {
        console.error('Error:', e.stack);
    } finally {
        await client.disconnectAsync(); // Close the connection
        console.log('Disconnected from Lawo MC² console');
    }
}

runClient();
