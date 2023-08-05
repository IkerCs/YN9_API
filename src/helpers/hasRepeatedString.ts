export default function (arr: string[]) {
	const stringSet = new Set();
  
	for (const item of arr) {
		if (typeof item === 'string') {
			if (stringSet.has(item)) {
				return true; // Found a repeated string
			}
			stringSet.add(item);
		}
	}
  
	return false; // No repeated string found
}