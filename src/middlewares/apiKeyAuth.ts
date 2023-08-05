import { Request, Response, NextFunction } from 'express';
import compare from '../helpers/compare';
import keys from '../../keys';

export default function (req: Request, res: Response, next: NextFunction): void {
	const apiKey: string = req.headers.authorization as string;
	if (typeof apiKey !== 'string') {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	if (compare(apiKey, keys.token)) {
		next();
	} else {
		res.status(401).json({ message: 'Unauthorized' });
	}
} 