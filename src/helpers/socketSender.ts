import WebSocket from 'ws';
import ws from '../server/websocket';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function (target: string, parameter: string, data: any) {
	ws.wss.clients.forEach((client: WebSocket) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ type: 'update', data: { target: target, parameter: parameter, data: data } }));
		}
	});
}
