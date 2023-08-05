import Keys from './keys';
import app from './src/server/express';
import mongoose from './src/server/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ws from './src/server/websocket';

ws.WebSocket();

process.stdout.write('Starting server...');
app.listen(3000, () => {
	process.stdout.write(`\rServer started => ${Keys.BASE_URI}\n`);
	mongoose(Keys.MONGODB_URI);
});

process.stdin.on('data', (data) => {
	if (data.toString() == 'rs') return;
	try {
		const result = eval(data.toString());
		console.log(result);
	} catch (error) {
		console.log(error);
	}
});

process.on('rejectionHandled', (error: Error) => {
	console.warn(error);
});

process.on('unhandledRejection', (error: Error) => {
	console.warn(error);
});