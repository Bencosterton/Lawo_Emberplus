const { EmberClient, EmberClientEvent } = require('node-emberplus');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
    .option('host', {
        alias: 'h',
        type: 'string',
        demandOption: true,
        description: 'Lawo VPRO host IP address',
    })
    .option('port', {
        alias: 'p',
        type: 'number',
        demandOption: true,
        description: 'Lawo VPRO port',
    })
    .help()
    .argv;

async function runClient() {
    const { host, port } = argv;
    const client = new EmberClient({ host, port });

    try {
        await client.connectAsync();

        // Node address, may be different for your VPro
        let matrix = await client.getElementByPathAsync("pro8/Video-Matrix/Matrix");

        // Someimtes it can have a second for conecitons to show
        await new Promise(resolve => setTimeout(resolve, 100));

        // Some formatting
        if (matrix.connections) {
            const formattedConnections = {};
            for (const [target, connection] of Object.entries(matrix.connections)) {
                formattedConnections[target] = {
                    target: connection.target,
                    sources: connection.sources
                };
            }
            console.log(JSON.stringify(formattedConnections, null, 2));
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.disconnectAsync();
        process.exit(0);
    }
}

runClient();
