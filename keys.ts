export default {
	token: 'super-secret-api-key',
	MONGODB_URI: 'mongodb://127.0.0.1/YN9_API',
	BASE_URI: 'http://localhost:3000',
	YN9_WEB_URI: 'http://localhost:4200',
	CLIENT: {
		ID: '746581603844751460',
		SECRET: '0DThQDkhKlCJHUUthcpwlpcNgnnm7gp2',
		CALLBACK_URL: '/auth/callback',
		SCOPE: ['identify', 'guilds'],
	},
	SESSION: {
		SECRET: '6+ltit63p0e_e0!i7?drathisp4s_@xutocri+u9ayi?!du+=$rlb9@!o#wl#5ve',
		RESAVE: false,
		SAVEUNINITIALIZED: false,
		COOKIE: {
			MAXAGE: 1000 * 60 * 24,
			SECURE: false,    
		}
	},
	JWT_SECRET: 'vu=1@PLv&zafrlge!1m?newl2omebr2y*cRedro9!39*fro*H1cru*Lt7*253?wr5tEphLTiDrebekLnlcrASplbrODItaPhuXo7tUspe!oW0!poGLwespuqET6TraxL'
};
