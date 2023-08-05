import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import keys from '../../keys';

export default function (req: Request, res: Response, next: NextFunction) {
	const token = req.header('Authorization');
	if (!token) return res.status(401).json({ message: 'No token provided' });

	jwt.verify(token, keys.JWT_SECRET, (err, user) => {
		if (err) return res.status(401).json({ message: 'Invalid token' });
		req.user = user;
		next();
	});
}
