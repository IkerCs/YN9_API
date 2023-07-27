import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import keys from './keys'

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    const apiKey: String = req.headers.authorization as String;
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

export function compare (a: String, b: String): boolean {
  const bufferA: Buffer = Buffer.from(a);
  const bufferB: Buffer = Buffer.from(b);

  const maxLength: number = Math.max(bufferA.length, bufferB.length);

  const paddedBufferA: Buffer = Buffer.alloc(maxLength, bufferA);
  const paddedBufferB: Buffer = Buffer.alloc(maxLength, bufferB);

  return crypto.timingSafeEqual(paddedBufferA, paddedBufferB);
}

export function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
} 