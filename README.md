# Lawo Emberplus / node-emberplus

This is an expansion on Gilles Dufour's Node.js EmberPlus implementation (https://github.com/dufourgilles/node-emberplus). 

This is a colletion fo nodejs script I've used to control or work with different Emberplus equipment in a brodcast setting. Maybe they will be helpful to you too.

EmberPlus view is a helpful tool to get element paths from emberplus equipment. -> (https://github.com/Lawo/ember-plus/releases)

## Example usage

### Node.js script Examples

### Lawo mc²

Commandline argument for connecting a source to a destination

```bash
node mc2_connect.js -h YOUR-CONSOLE-IP-ADDRESS -p 9000 -s 123 -t 1234 
```

Martix Connection (mc2_connect.js)

```javascript
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
```

Commandline argument for disconnecting a source and destination

```bash
node mc2_disconnect.js -h YOUR-CONSOLE-IP-ADDRESS -p 9000 -s 123 -t 1234 
```

Martix Disconnection (mc2_disconnect.js)

```javascript
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
```

Commandline argument for connection to mc² and reading GPIO state. 

```bash
node mc2_micLive.js -h YOUR-CONSOLE-IP-ADDRESS -p 9000
```

MC2_micLive.js

```javascript
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
```


### Lawo V_Pro8

Commandline argument for Connecting to a VPro8 and getting the vdeo martix crosspoints
```bash
node vpro_matrix.js -h YOUR-VPRO-IP-ADDRESS -p 9000
```

Martix Disconnection (VPRO_matrixDiscover.js)

```javascript
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
```
