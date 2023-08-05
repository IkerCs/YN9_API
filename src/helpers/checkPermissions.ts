export default function (permissions: string[]) {
	const valid_permissions: string[] = [
		'AddReactions', 'Administrator', 'AttachFiles', 'BanMembers', 'ChangeNickname',
		'Connect', 'CreateInstantInvite', 'CreatePrivateThreads', 'CreatePublicThreads',
		'DeafenMembers', 'EmbedLinks', 'KickMembers', 'ManageChannels', 'ManageEmojisAndStickers',
		'ManageEvents', 'ManageGuild', 'ManageGuildExpressions', 'ManageMessages',
		'ManageNicknames', 'ManageRoles', 'ManageThreads', 'ManageWebhooks', 'MentionEveryone',
		'ModerateMembers', 'MoveMembers', 'MuteMembers', 'PrioritySpeaker', 'ReadMessageHistory',
		'RequestToSpeak', 'SendMessages', 'SendMessagesInThreads', 'SendTTSMessages',
		'SendVoiceMessages', 'Speak', 'Stream', 'UseApplicationCommands', 'UseEmbeddedActivities',
		'UseExternalEmojis', 'UseExternalSounds', 'UseExternalStickers', 'UseSoundboard',
		'UseVAD', 'ViewAuditLog', 'ViewChannel', 'ViewCreatorMonetizationAnalytics',
		'ViewGuildInsights',
	];
	if (!permissions.some((permission) => valid_permissions.includes(permission))) return false;
	return true;
}


