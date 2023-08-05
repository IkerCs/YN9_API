import { Router } from 'express';
import jwt from 'jsonwebtoken';

import keys from '../../../keys';
import passport from '../../server/passport';
import User from '../../@types/user';
import { Guild } from '../../schema/guild';
import userLogin from '../../schema/user-login';

const router = Router();

router.use('/login', passport.authenticate('discord', { scope: ['identify', 'guilds', 'guilds.join'] }));
router.use('/login-no-join', passport.authenticate('discord', { scope: ['identify', 'guilds'] }));

router.use('/callback', passport.authenticate('discord', { failureRedirect: '/auth/login' }), async (req, res) => {
	const user = req.user as User;
	const payload = {
		id: user.profile.id,
		accessToken: user.profile.accessToken,
	};
	const token = jwt.sign(payload, keys.JWT_SECRET, {
		'expiresIn': '1d',
		'algorithm': 'HS256',
	});

	const guilds = await Guild.find();
	for (const guild of user.profile.guilds) {
		guild.yn9 = guilds.some((g) => g.guildId == guild.id);
	}

	const userDb: User | null = await userLogin.findOne({ 'profile.id': user.profile.id });
	if (!userDb) await userLogin.create(user);
	else await userLogin.updateOne({ 'profile.id': user.profile.id }, user);
	
	res.redirect(`${keys.YN9_WEB_URI}/oauth2/?token=${token}`);
});

router.use('/logout', (req, res, next) => {
	req.logout((err: Error) => {
		if (err) return next(err);
		res.redirect(keys.YN9_WEB_URI);
	});
});

export default router;