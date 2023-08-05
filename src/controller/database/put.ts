import { Request, Response } from 'express';
import { Guild } from '../../schema/guild';

const ctrl = {
	index: async (req: Request, res: Response) => {
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
};

export default ctrl;