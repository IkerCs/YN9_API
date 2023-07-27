import { Request, Response } from 'express';
import { Server } from 'ws';
import { Guild, GuildObject } from '../schema/guild';
import socketSender from './socketSender';

export default async function (req: Request, res: Response, wss: Server) {
    switch (req.path) {
        case '/': await main(req, res, wss); break;
        case '/prefixes': await prefixes(req, res, wss); break;
        case '/warnings': await warnings(req, res, wss); break;
        case '/commands': await commands(req, res, wss); break;
        default: res.status(404).json({ message: 'Not Found' }); break;
    }
}

async function main (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    if (!guild_header) return res.status(400).json({ message: 'Bad Request' });
    const guild = await Guild.findOne({ guildId: guild_header });
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    try {
        await Guild.deleteOne({ guildId: guild_header });
        res.status(200).json({ message: 'Guild deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function commands (req: Request, res: Response, wss: Server) {
    const guild_header = req.headers?.guild as string;
    const command: string = req.body?.value as string;
    if (!guild_header || !command) return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    if (!guild.commands.filter((c) => c.command == command)) return res.status(404).json({ message: 'Command not found' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { $pull: { commands: { command: command } } });
        const commands = (await Guild.findOne({ guildId: guild_header }))?.commands;
        await socketSender(wss, guild_header, 'commands', commands);
        res.status(200).json({ message: 'Command deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function prefixes (req: Request, res: Response, wss: Server) {
    const guild_header = req.headers?.guild as string;
    const prefix: string = req.body?.value as string;
    if (!guild_header || !prefix) return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    console.log(prefix);
    console.log(guild.prefixes.includes(prefix));
    if (!guild.prefixes.find((x) => x == prefix)) return res.status(404).json({ message: 'Prefix not found' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { $pull: { prefixes: prefix } });
        await socketSender(wss, guild_header, 'prefixes', (await Guild.findOne({ guildId: guild_header }))?.prefixes);
        res.status(200).json({ message: 'Prefix deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function warnings (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const warning_id: string = req.body?.value as string;
    if (!guild_header || !warning_id) return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!guild.warnings.filter((w) => w.id == warning_id)) return res.status(404).json({ message: 'Warning not found' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { $pull: { warnings: { id: warning_id } } });
        res.status(200).json({ message: 'Warning deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}