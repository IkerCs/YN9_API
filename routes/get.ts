import { Request, Response } from 'express';
import { Server } from 'ws';
import { Guild, GuildObject } from '../schema/guild';

export default async function (req: Request, res: Response, wss: Server) {
    switch (req.path) {
        case '/': await main(req, res, wss); break;
        case '/param': await param(req, res, wss); break;
        default: res.status(404).json({ message: 'Not Found' }); break;
    }
}

async function main (req: Request, res: Response, wss: Server) {
    const guild_header: String = req.headers?.guild as String;
    if (typeof guild_header !== 'string') res.status(400).json({ message: 'Bad Request' });

    const guild = await Guild.findOne({ guildId: guild_header });
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    res.status(200).json(guild);
}
async function param (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const param_query: string = req.query?.v as string;
    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof param_query !== 'string') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!guild[param_query]) return res.status(404).json({ message: 'Param not found' });
    return res.status(200).json({ value: guild[param_query] });
}