import passport from 'passport';
import DiscordStrategy from 'passport-discord';

import Keys from '../../keys';

passport.use(new DiscordStrategy({
	clientID: Keys.CLIENT.ID,
	clientSecret: Keys.CLIENT.SECRET,
	callbackURL: Keys.BASE_URI + Keys.CLIENT.CALLBACK_URL,
	scope: Keys.CLIENT.SCOPE
}, (accessToken, refreshToken, profile, done) => {
	return done(null, { profile, accessToken });
}));

passport.serializeUser((user, done) => done(null, user));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser((obj: any, done) => {
	done(null, obj);
});

export default passport;