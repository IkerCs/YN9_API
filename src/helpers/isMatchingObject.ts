/* eslint-disable @typescript-eslint/no-explicit-any */
import getTotalKeys from './getTotalKeys';

const typeofs: { [key: string]: string } = {  
	'b': 'boolean',
	's': 'string',
	'bi': 'bigint',
	'f': 'function',
	'n': 'number',
	'o': 'object',
	'sy': 'symbol',
	'u': 'undefined',
};

export default function(obj: any, parameters: string[]): boolean {
	let parametersTested = 0;
	for (const parameter of parameters) {
		parametersTested++;
		if (!parameter.includes('.')) {
			const value = parameter.split(':')[0];
			const type = parameter.split(':')[1];
			if (typeof obj[value] != typeofs[type]) return false;
		} else {
			let tree: any = obj;
			let last: any = null;
			for (const child of parameter.split('.')) {
				if (tree[child]) tree = tree[child];
				else last = child;
			}
			const type = last.split(':')[1];
			const value = last.split(':')[0];
			if (typeof tree[value] != typeofs[type]) return false;
		}
	}
	if (getTotalKeys(obj) != parametersTested) return false;
	return true;
}
