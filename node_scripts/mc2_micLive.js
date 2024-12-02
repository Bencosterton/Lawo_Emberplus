const { EmberClient, EmberClientEvent } = require('node-emberplus');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('host', {
        alias: 'h',
        type: 'string',
        demandOption: true,
        description: 'Device IP address'
    })
    .option('port', {
        alias: 'p',
        type: 'number',
        default: 9000,
        description: 'Device port'
    })
    .help()
    .argv;

async function monitorVariable() {
    const client = new EmberClient({ 
        host: argv.host, 
        port: argv.port,
        keepAlive: true
    });

    let lastState = null;

    try {
        await client.connectAsync();
        console.log(`Connected to ${argv.host}:${argv.port}`);

        // Set up interval to check state
        const interval = setInterval(async () => {
            try {
                const element = await client.getElementByPathAsync("_3/_f1/_38/_0/_fdc574e/_3ea/_60240002");  // This is the element path of my GPIO, get your own.
                const currentState = element.value;

                // Only log when state changes
                if (currentState !== lastState) {
                    const timestamp = new Date().toISOString();
                    console.log(`${timestamp}: State changed to ${currentState}`);
                    lastState = currentState;
                }
            } catch (e) {
                console.error('Error reading value:', e.message);
            }
        }, 1000);

        // Handle script termination
        process.on('SIGINT', async () => {
            clearInterval(interval);
            await client.disconnectAsync();
            console.log('\nMonitoring stopped');
            process.exit(0);
        });

    } catch (e) {
        console.error('Connection error:', e.message);
        process.exit(1);
    }
}

monitorVariable();
