import { Request, Response } from 'express';

import { Guild, GuildObject, Publication, Log, Warning, Confession, Ignore, Command } from '../../schema/guild';
import socketSender from '../../helpers/socketSender';
import hasRepeatedString from '../../helpers/hasRepeatedString';
import filterPunishments from '../../helpers/filterPunishments';
import isMatchingObject from '../../helpers/isMatchingObject';
import checkPermissions from '../../helpers/checkPermissions';

const ctrl = {
	prefixes: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const prefixes_body: string = req.body?.value as string;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof prefixes_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		if (guild.prefixes.filter((prefix: string) => prefix == prefixes_body).length > 0) return res.status(409).json({ message: 'Prefix already exists' });

		try {
			await Guild.updateOne({ guildId: guild_header }, { $push: { prefixes: prefixes_body } });
			const allPrefixes: string[] = guild.prefixes;
			allPrefixes.push(prefixes_body);
			await socketSender(guild_header, 'prefixes', allPrefixes);
			res.status(200).json({ message: 'Prefix added successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	antimod: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const antimod_body: any = req.body;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		const antimod: string = req.path.split('/')[1];

		const possibleOptions: { [key: string]: string[] } = {
			'antiInvites': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n'],
			'antiLinks': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n'],
			'antiMayus': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n', 'caps:n', 'min:n'],
			'antiFlood': ['channels:o', 'roles:o', 'users:o', 'active:b', 'punishment:o', 'punishment.type:s', 'punishment.duration:n', 'mps:n', 'seg:n'],
		};

		if (!possibleOptions[antimod] || !isMatchingObject(antimod_body, possibleOptions[antimod])) return res.status(400).json({ message: 'Bad Request' });
		if (!filterPunishments(antimod_body.punishment.type)) return res.status(400).json({ message: 'Bad Request, invalid punishment type' });

		if (hasRepeatedString(antimod_body.channels)
			|| hasRepeatedString(antimod_body.roles)
			|| hasRepeatedString(antimod_body.users)) return res.status(400).json({ message: 'Bad Request, repeated parameters' });

		try {
			await Guild.updateOne({ guildId: guild_header }, { [antimod]: antimod_body });
			await socketSender(guild_header, antimod, antimod_body);
			res.status(200).json({ message: `${antimod} edited successfully` });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	publication: async (req: Request, res: Response) => {
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
			await socketSender(guild_header, publication, publication_body);
			res.status(200).json({ message: `${publication} edited successfully` });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	logs: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const logs_body: Log = req.body as Log;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof logs_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		if (!isMatchingObject(logs_body, ['channel:s', 'ignored:s'])) return res.status(400).json({ message: 'Bad Request' });

		const log: string = req.path.split('/')[1];
		try {
			await Guild.updateOne({ guildId: guild_header }, { $set: { [log]: logs_body } });
			await socketSender(guild_header, log, logs_body);
			res.status(200).json({ message: `${log} edited successfully` });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	confessions: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const confessions_body: Confession = req.body as Confession;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof confessions_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		if (!isMatchingObject(confessions_body, ['channel:s', 'log:s'])) return res.status(400).json({ message: 'Bad Request' });
		try {
			await Guild.updateOne({ guildId: guild_header }, { $set: { confessions: confessions_body } });
			await socketSender(guild_header, 'confessions', confessions_body);
			res.status(200).json({ message: 'Confessions edited successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	muteRole: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const muteRole_body: string = req.body?.value as string;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof muteRole_body !== 'string') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		try {
			await Guild.updateOne({ guildId: guild_header }, { $set: { muteRole: muteRole_body } });
			await socketSender(guild_header, 'muteRole', muteRole_body);
			res.status(200).json({ message: 'Mute role edited successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	command: async (req: Request, res: Response) => {
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
			await socketSender(guild_header, 'commands', newCommands);

			res.status(200).json({ message: 'Command edited successfully' });
		} catch (err) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	ignore: async (req: Request, res: Response) => {
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
			await socketSender(guild_header, 'ignore', ignore_body);
			res.status(200).json({ message: 'Ignore edited successfully' });
		} catch (err) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	warnings: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const warning_body: Warning = req.body as Warning;

		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof warning_body !== 'object') return res.status(400).json({ message: 'Bad Request' });

		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });

		if (!isMatchingObject(warning_body, ['user_id:s', 'type:s', 'reason:s', 'moderator:s', 'date:n', 'id:s', 'expires:n', 'active:b'])) return res.status(400).json({ message: 'Bad Request' });

		try {
			await Guild.updateOne({ guildId: guild_header }, { $pull: { warnings: { id: warning_body.id } } });
			await Guild.updateOne({ guildId: guild_header }, { $push: { warnings: warning_body } });
			res.status(200).json({ message: 'Warning pushed successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

export default ctrl;