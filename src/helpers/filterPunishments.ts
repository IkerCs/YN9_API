export default function (punishmentType: string): boolean {
	const valid_punishments: string[] = ['ban', 'kick', 'mute', 'warn', 'text-warning'];
	if (!valid_punishments.includes(punishmentType)) return false;
	return true;
}