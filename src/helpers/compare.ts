import crypto from 'crypto';

export default function (a: string, b: string): boolean {
	const bufferA: Buffer = Buffer.from(a);
	const bufferB: Buffer = Buffer.from(b);

	const maxLength: number = Math.max(bufferA.length, bufferB.length);

	const paddedBufferA: Buffer = Buffer.alloc(maxLength, bufferA);
	const paddedBufferB: Buffer = Buffer.alloc(maxLength, bufferB);

	return crypto.timingSafeEqual(paddedBufferA, paddedBufferB);
}