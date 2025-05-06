const { EmberClient, EmberClientEvent, Emberlib, LoggingService } =
require('node-emberplus');

async function runClient() {
	const host = '10.10.124.4'; // Lawo IP
	const port = 9000;
	const client = new EmberClient({ host, port, logger: new LoggingService(5) });
	
	client.on(EmberClientEvent.ERROR, e => {
		console.error('Error:', e);
	});
	
	try {
		await client.connectAsync();
		console.log('connected to Lawo MC2 console at ${host}:${port}');
		
		let isoOff = await client.getElementByPathAsync("2.3.16950.16951.23538.23539.24168.24170.24178");  // element of the channel ISO
		console.log('ISO Off:', isoOff);
		
		if (isoOff && isoOff.contents && isoOff.contents.value !== undefined) { 
			await client.setValueAsync(isoOff, true); // Change value to false here to turn it off
			console.log('Iso value set to false');
		}
		
	} finally {
		await client.disconnectAsync();
		console.log('Disconnected from LAwo Mc2 console');
	}
}

runClient();
