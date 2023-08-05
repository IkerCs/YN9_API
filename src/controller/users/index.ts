import { Router } from 'express';
import jwt from '../../middlewares/jwt';
import jwtUser from '../../@types/jwtUser';
import userLogin from '../../schema/user-login';
import User from '../../@types/user';
import { Guild, GuildObject } from '../../schema/guild';

const router = Router();
const cache = new Map();

router.get('/', jwt, async (req, res) => {
	const jwtuser: jwtUser | null = req.user as jwtUser;
	if (!jwtuser) return res.status(401).json({ message: 'Unauthorized' });
	if (!cache.get(jwtuser.id)) {
		const user: User | null = await userLogin.findOne({ 'profile.id': jwtuser.id });
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		cache.set(user.profile.id, user);
		return res.status(200).json(user);
	}
	return res.status(200).json(cache.get(jwtuser.id));
});

router.get('/guild/:id', jwt, async (req, res) => {
	const jwtuser: jwtUser | null = req.user as jwtUser;
	if (!jwtuser) return res.status(401).json({ message: 'Unauthorized' });
	let user: User | null = cache.get(jwtuser.id);
	if (!user) {
		user = await userLogin.findOne({ 'profile.id': jwtuser.id });
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		cache.set(user.profile.id, user);
	}

	const partial_guild = user.profile.guilds.find((guild) => guild.id === req.params.id);
	if (!partial_guild) return res.status(404).json({ message: 'Guild not found' });
	console.log(partial_guild.permissions);
	if (!(partial_guild.permissions & 0x20)) return res.status(403).json({ message: 'Not enough permissions' });
	
	let config_guild: GuildObject | null = await Guild.findOne({ guildId: req.params.id });
	if (!config_guild) config_guild = await Guild.create({ guildId: req.params.id }) as unknown as GuildObject;
	if (!config_guild) return res.status(500).json({ message: 'Internal server error' });

	const guild = {
		partial: partial_guild,
		config: config_guild,
	};

	res.status(200).json(guild);
});

export default router;
