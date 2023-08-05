// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function getTotalKeys(obj: any): number {
	let count: number = 0;
    
	const keys: string[] = Object.keys(obj);

	for (const key of keys) {
		if (typeof obj[key] == 'object' && !Array.isArray(obj[key])) {
			count += getTotalKeys(obj[key]);
		}
		count++;
	}

	return count;
}