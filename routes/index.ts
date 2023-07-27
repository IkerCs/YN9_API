import { Express, Request, Response } from 'express';
import { Server } from 'ws';
import { apiKeyAuth } from '../middlewares';
import get from './get';
import post from './post';
import put from './put';
import del from './delete';

export default function (app: Express, wss: Server) {
    app.get('*', apiKeyAuth, async (req: Request, res: Response) => await get(req, res, wss));
    app.post('*', apiKeyAuth, async (req: Request, res: Response) => await post(req, res, wss));
    app.put('*', apiKeyAuth, async (req: Request, res: Response) => await put(req, res, wss));
    app.delete('*', apiKeyAuth, async (req: Request, res: Response) => await del(req, res, wss));
}