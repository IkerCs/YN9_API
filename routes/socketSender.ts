import WebSocket, { Server } from 'ws';

export default async function (wss: Server, target: string, parameter: string, data: any) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', data: { target: target, parameter: parameter, data: data } }));
        }
    });
}
