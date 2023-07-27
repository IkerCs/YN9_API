import express, { Response, Request } from 'express';
import mongoose from 'mongoose';
import WebSocket from 'ws';
import Morgan from 'morgan';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import Keys from './keys';
import Router from './routes/index';
import { isJSON, compare } from './middlewares';
const app = express();
const wss = new WebSocket.Server({ port: 8080 });

app.use(cors());

app.use(express.json());  

app.use(express.urlencoded({ extended: true }));


app.use(Morgan('dev'));

app.set('port', process.env.PORT || 3000);

Router(app, wss);

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "404: Not Found", code: 0 });
});

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    console.log(chalk.blue(`Client connected (${clientId}), connected clients: ${wss.clients.size}, pending for authentication`));
    let isAuthenticated: boolean = false;
    let authenticationTimer: NodeJS.Timeout = setTimeout(() => {
        if (!isAuthenticated) {
            console.log(chalk.magenta(`Client authentication timed out, closing connection`));
            ws.close();
        }
    }, 10000);

    ws.on('message', (message) => {
        if (!isJSON(message.toString())) return;
        const type: string = JSON.parse(message.toString()).type;
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
});

wss.on('close', () => {
    console.log(`Client disconnected`);
})

process.stdin.on('data', (data) => {
    if (data.toString() == 'rs') return;
    try {
        const result = eval(data.toString());
        console.log(result);
    } catch (error) {
        console.log(error);
    }
})


process.stdout.write('Starting server...');

app.listen(3000, () => {
    process.stdout.write(`\rServer started => ${Keys.BASE_URI}:${app.get('port')}\n`);
    process.stdout.write('Connecting to MongoDB database...');
    mongoose.connect(Keys.MONGODB_URI)
        .then((connection) => {
            process.stdout.write(`\rConnected to ${connection.connection.db.databaseName}                \n`);
        })
        .catch((e) => {
            process.stdout.write(`\rFailed to connect to MongoDB database\n`);
            process.stdout.write(`\r${e}\n`);
            process.exit(1);
        });
});

