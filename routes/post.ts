import { Request, Response } from 'express';
import { Server } from 'ws';
import { Guild, GuildObject, AntiModSettings, Punishment, Publication, Log, Warning, Confession, Ignore, Command, AntiMayus, AntiFlood } from '../schema/guild';
import socketSender from './socketSender';

export default async function (req: Request, res: Response, wss: Server) {
    switch (req.path) {
        case '/prefixes': await prefixes(req, res, wss); break;
        case '/antiInvites': await antimod(req, res, wss); break;
        case '/antiLinks': await antimod(req, res, wss); break;
        case '/antiMayus': await antimod(req, res, wss); break;
        case '/antiFlood': await antimod(req, res, wss); break;
        case '/welcomes': await publication(req, res, wss); break;
        case '/leaves': await publication(req, res, wss); break;
        case '/messageLogs': await logs(req, res, wss); break;
        case '/mediaLogs': await logs(req, res, wss); break;
        case '/memberLogs': await logs(req, res, wss); break;
        case '/reactionLogs': await logs(req, res, wss); break;
        case '/commandLogs': await logs(req, res, wss); break;

        case '/warnings': await warnings(req, res, wss); break;
        
        case '/confessions': await confessions(req, res, wss); break;
        case '/ignore': await ignore(req, res, wss); break;
        case '/muteRole': await muteRole(req, res, wss); break;
        case '/commands': await command(req, res, wss); break;

        default: res.status(404).json({ message: 'Not Found' }); break;
    }
}

async function antimod (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const antimod_body: any = req.body;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    const antimod: string = req.path.split('/')[1];

    let possibleOptions: { [key: string]: string[] } = {
        'antiInvites': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n'],
        'antiLinks': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n'],
        'antiMayus': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n', 'caps:n', 'min:n'],
        'antiFlood': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n', 'mps:n', 'seg:n'],
    }

    if (!possibleOptions[antimod] || !isMatchingObject(antimod_body, possibleOptions[antimod])) return res.status(400).json({ message: 'Bad Request' });
    if (!filterPunishments(antimod_body.punishment.type)) return res.status(400).json({ message: 'Bad Request, invalid punishment type' });

    if (hasRepeatedString(antimod_body.channels)
     || hasRepeatedString(antimod_body.roles)
     || hasRepeatedString(antimod_body.users)) return res.status(400).json({ message: 'Bad Request, repeated parameters' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { [antimod]: antimod_body } );
        await socketSender(wss, guild_header, antimod, antimod_body);
        res.status(200).json({ message: `${antimod} edited successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function ignore (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const ignore_body: Ignore = req.body as Ignore;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof ignore_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!isMatchingObject(ignore_body, ['channels:o', 'roles:o', 'users:o'])) return res.status(400).json({ message: 'Bad Request' });

    if (hasRepeatedString(ignore_body.channels)
     || hasRepeatedString(ignore_body.roles)
     || hasRepeatedString(ignore_body.users)) return res.status(400).json({ message: 'Bad Request, repeated parameters' });

     try {
        await Guild.updateOne({ guildId: guild_header }, { $set: { ignore: ignore_body } });
        await socketSender(wss, guild_header, 'ignore', ignore_body);
        res.status(200).json({ message: 'Ignore edited successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function publication (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const publication_body: Publication = req.body as Publication;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof publication_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!isMatchingObject(publication_body, ['channel:s', 'message:s'])) return res.status(400).json({ message: 'Bad Request' });

    const publication: string = req.path.split('/')[1];
    try {
        await Guild.updateOne({ guildId: guild_header }, { $set: { [publication]: publication_body } });
        await socketSender(wss, guild_header, publication, publication_body);
        res.status(200).json({ message: `${publication} edited successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function logs (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const logs_body: Log = req.body as Log;
    
    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof logs_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!isMatchingObject(logs_body, ['channel:s', 'ignored:s'])) return res.status(400).json({ message: 'Bad Request' });

    const log: string = req.path.split('/')[1];
    try {
        await Guild.updateOne({ guildId: guild_header }, { $set: { [log]: logs_body} });
        await socketSender(wss, guild_header, log, logs_body);
        res.status(200).json({ message: `${log} edited successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function prefixes (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const prefixes_body: string = req.body?.value as string;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof prefixes_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (guild.prefixes.filter((prefix) => prefix == prefixes_body).length > 0) return res.status(409).json({ message: 'Prefix already exists' });
    
    try {
        await Guild.updateOne({ guildId: guild_header}, { $push: { prefixes: prefixes_body} });
        const allPrefixes: string[] = guild.prefixes;
        allPrefixes.push(prefixes_body);
        await socketSender(wss, guild_header, 'prefixes', allPrefixes);
        res.status(200).json({ message: 'Prefix added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function confessions (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const confessions_body: Confession = req.body as Confession;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof confessions_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!isMatchingObject(confessions_body, ['channel:s', 'log:s'])) return res.status(400).json({ message: 'Bad Request' });
    try {
        await Guild.updateOne({ guildId: guild_header }, { $set: { confessions: confessions_body } });
        await socketSender(wss, guild_header, 'confessions', confessions_body);
        res.status(200).json({ message: 'Confessions edited successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function muteRole (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const muteRole_body: string = req.body?.value as string;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof muteRole_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { $set: { muteRole: muteRole_body } });
        await socketSender(wss, guild_header, 'muteRole', muteRole_body);
        res.status(200).json({ message: 'Mute role edited successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function command (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const command_body: Command = req.body as Command;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request, invalid guild header' });
    if (typeof command_body !== 'object') return res.status(400).json({ message: 'Bad Request, invalid command body type' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    
    if (!isMatchingObject(command_body, ['command:s', 'enabled:b', 'permissions:o', 'permissions.bot:o', 'permissions.user:o', 'permissions.roles:o', 'ignore:o', 'ignore.channels:o', 'ignore.roles:o', 'ignore.users:o', 'cooldown:o', 'cooldown.duration:n', 'cooldown.users:o'])) return res.status(400).json({ message: 'Bad Request, parameters incomplete' });
    if (command_body.permissions.bot?.length > 0 && !checkPermissions(command_body.permissions.bot)) return res.status(400).json({ message: 'Bad Request, invalid bot permissions' });
    if (command_body.permissions.user?.length > 0 && !checkPermissions(command_body.permissions.user)) return res.status(400).json({ message: 'Bad Request, invalid user permissions' });

    try {
        await Guild.updateOne({ guildId: guild_header }, { $pull: { commands: { command: command_body.command } } });
        await Guild.updateOne({ guildId: guild_header }, { $push: { commands: command_body } });

        const newCommands = (await Guild.findOne({ guildId: guild_header }))?.commands;
        await socketSender(wss, guild_header, 'commands', newCommands);

        res.status(200).json({ message: 'Command edited successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function warnings (req: Request, res: Response, wss: Server) {
    const guild_header: string = req.headers?.guild as string;
    const warning_body: Warning = req.body as Warning;

    if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
    if (typeof warning_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

    const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (!isMatchingObject(warning_body, ['user_id:s', 'type:s', 'reason:s', 'moderator:s', 'date:n', 'id:s', 'expires:n', 'active:b'])) return res.status(400).json({ message: 'Bad Request' })

    try {
        await Guild.updateOne({ guildId: guild_header }, { $pull: { warnings: { id: warning_body.id } } });
        await Guild.updateOne({ guildId: guild_header }, { $push: { warnings: warning_body } });
        res.status(200).json({ message: 'Warning pushed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const typeofs: { [key: string]: string } = {  
    'b': 'boolean',
    's': 'string',
    'bi': 'bigint',
    'f': 'function',
    'n': 'number',
    'o': 'object',
    'sy': 'symbol',
    'u': 'undefined',
}

function isMatchingObject(obj: any, parameters: string[]): boolean {
    let parametersTested = 0;
    for (const parameter of parameters) {
        parametersTested++;
        if (!parameter.includes('.')) {
            const value = parameter.split(':')[0];
            const type = parameter.split(':')[1];
            if (typeof obj[value] != typeofs[type]) return false;
        } else {
            let tree: any = obj;
            let last: any = null;
            for (const child of parameter.split('.')) {
                if (tree[child]) tree = tree[child];
                else last = child;
            }
            const type = last.split(':')[1];
            const value = last.split(':')[0];
            if (typeof tree[value] != typeofs[type]) return false;
        }
    }
    if (getTotalKeys(obj) != parametersTested) return false;
    return true;
}

function getTotalKeys(obj: any): number {
    let count: number = 0;
    
    let keys: string[] = Object.keys(obj);

    for (const key of keys) {
        if (typeof obj[key] == 'object' && !Array.isArray(obj[key])) {
            count += getTotalKeys(obj[key]);
        }
        count++;
    }

    return count;
}
  

function checkPermissions (permissions: string[]) {
    const valid_permissions: string[] = [
        "AddReactions", "Administrator", "AttachFiles", "BanMembers", "ChangeNickname",
        "Connect", "CreateInstantInvite", "CreatePrivateThreads", "CreatePublicThreads",
        "DeafenMembers", "EmbedLinks", "KickMembers", "ManageChannels", "ManageEmojisAndStickers",
        "ManageEvents", "ManageGuild", "ManageGuildExpressions", "ManageMessages",
        "ManageNicknames", "ManageRoles", "ManageThreads", "ManageWebhooks", "MentionEveryone",
        "ModerateMembers", "MoveMembers", "MuteMembers", "PrioritySpeaker", "ReadMessageHistory",
        "RequestToSpeak", "SendMessages", "SendMessagesInThreads", "SendTTSMessages",
        "SendVoiceMessages", "Speak", "Stream", "UseApplicationCommands", "UseEmbeddedActivities",
        "UseExternalEmojis", "UseExternalSounds", "UseExternalStickers", "UseSoundboard",
        "UseVAD", "ViewAuditLog", "ViewChannel", "ViewCreatorMonetizationAnalytics",
        "ViewGuildInsights",
    ];
    if (!permissions.some((permission) => valid_permissions.includes(permission))) return false;
    return true;
}

function filterPunishments (punishmentType: string): boolean {
    const valid_punishments: string[] = ['ban', 'kick', 'mute', 'warn', 'text-warning'];
    if (!valid_punishments.includes(punishmentType)) return false;
    return true;
}

function hasRepeatedString(arr: string[]) {
    const stringSet = new Set();
  
    for (const item of arr) {
      if (typeof item === 'string') {
        if (stringSet.has(item)) {
          return true; // Found a repeated string
        }
        stringSet.add(item);
      }
    }
  
    return false; // No repeated string found
}