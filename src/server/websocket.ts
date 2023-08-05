import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import webSocket from 'ws';

import compare from '../helpers/compare';
import isJSON from '../helpers/isJSON';
import Keys from '../../keys';

const wss = new webSocket.Server({ port: 8080 });
function WebSocket () {

	wss.on('connection', (ws) => {
		const clientId = uuidv4();
		console.log(chalk.blue(`Client connected (${clientId}), connected clients: ${wss.clients.size}, pending for authentication`));
		let isAuthenticated: boolean = false;

		ws.on('message', (message) => {
			if (!isJSON(message.toString())) return;
			const type: string = JSON.parse(message.toString()).type;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const data: any = JSON.parse(message.toString()).data;
			switch (type) {
			case 'auth':
				if (compare(data.Authorization, Keys.token)) {
					isAuthenticated = true;
					clearTimeout(authenticationTimer);
					console.log(chalk.green(`Client authenticated (${clientId}), connected clients: ${wss.clients.size}`));
				}
				break;
			case 'ping':
				ws.send(JSON.stringify({ type: 'pong', data: {} }));
				break;
			default:
				break;
			}
		});

		ws.on('close', () => {
			clearTimeout(authenticationTimer);
			console.log(chalk.red(`Client disconnected (${clientId}), connected clients: ${wss.clients.size}`));
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});

		const authenticationTimer: NodeJS.Timeout = setTimeout(() => {
			if (!isAuthenticated) {
				console.log(chalk.magenta('Client authentication timed out, closing connection'));
				ws.close();
			}
		}, 10000);
	});

	wss.on('close', () => {
		console.log('Client disconnected');
	});
}

export default { WebSocket, wss };
