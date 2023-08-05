export default function(str: string) {
	try {
		JSON.parse(str);
		return true;
	} catch (error) {
		return false;
	}
} 