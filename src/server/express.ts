import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';

import Keys from '../../keys';
import routes from '../controller/router';
import passport from './passport';

const app = express();

app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('port', process.env.PORT || 3000);

app.use(session({
	secret: Keys.SESSION.SECRET,
	resave: Keys.SESSION.RESAVE,
	saveUninitialized: Keys.SESSION.SAVEUNINITIALIZED,
	cookie: {
		maxAge: Keys.SESSION.COOKIE.MAXAGE,
		secure: Keys.SESSION.COOKIE.SECURE,
	}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

export default app;