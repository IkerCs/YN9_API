import { Request, Response } from 'express';
import { Server } from 'ws';
import { Guild } from '../schema/guild';

export default async function (req: Request, res: Response, wss: Server) {
    switch (req.path) {
        case '/': await main(req, res, wss); break;

        default: res.status(404).json({ message: 'Not Found' }); break;
    }
}

async function main (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    if (!guild_header) return res.status(400).json({ message: 'Bad Request' });

    if (await Guild.findOne({ guildId: guild_header })) return res.status(409).json({ message: 'Guild already exists' });

    try {
        await Guild.create({ guildId: guild_header });
        res.status(200).json({ message: 'Guild created' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}