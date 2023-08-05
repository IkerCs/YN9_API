import { Request, Response } from 'express';
import { GuildObject, Guild, Warning } from '../../schema/guild';

const ctrl = {
	index: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		if (typeof guild_header !== 'string') res.status(400).json({ message: 'Bad Request' });
	
		const guild = await Guild.findOne({ guildId: guild_header });
		if (!guild) return res.status(404).json({ message: 'Guild not found' });
	
		res.status(200).json(guild);
	},
	activeWarnings: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
	
		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });
	
		const activeWarnings = guild.warnings.filter((warning: Warning) => warning.active);
		return res.status(200).json(activeWarnings);	
	},
	param: async (req: Request, res: Response) => {
		const guild_header: string = req.headers?.guild as string;
		const param_query: string = req.query?.v as string;
		if (typeof guild_header !== 'string') return res.status(400).json({ message: 'Bad Request' });
		if (typeof param_query !== 'string') return res.status(400).json({ message: 'Bad Request' });
	
		const guild: GuildObject = await Guild.findOne({ guildId: guild_header }) as GuildObject;
		if (!guild) return res.status(404).json({ message: 'Guild not found' });
	
		if (!guild[param_query]) return res.status(404).json({ message: 'Param not found' });
		return res.status(200).json({ value: guild[param_query] });
	}	
};

export default ctrl;