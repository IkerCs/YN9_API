import mongoose from 'mongoose';

/**
 * WARNINGS TYPES
 * text-warning
 * warning
 * mute
 * kick
 * ban
 */
const schema = new mongoose.Schema({
    guildId: { type: mongoose.SchemaTypes.String, required: true },
    prefixes: { type: mongoose.SchemaTypes.Array, default: ['y?', '{client.mention}'], },
    
    antiInvites: { type: mongoose.SchemaTypes.Mixed, default: { channels: [], roles: [], users: [], active: false, punishment: { type: 'text-warning', duration: -1 } }, },
    antiLinks: { type: mongoose.SchemaTypes.Mixed, default: { channels: [], roles: [], users: [], active: false, punishment: { type: 'text-warning', duration: -1 } } },
    antiMayus: { type: mongoose.SchemaTypes.Mixed, default: { channels: [], roles: [], users: [], active: false, caps: 70, min: 10, punishment: { type: 'text-warning', duration: -1 } }, },
    antiFlood: { type: mongoose.SchemaTypes.Mixed, default: { channels: [], roles: [], users: [], active: false, mps: 10, seg: 10, punishment: { type: 'mute', duration: 60 * 1000 } }, },

    welcomes: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, message: null, } },
    leaves: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, message: null, } },

    messageLogs: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, ignored: [] } },
    mediaLogs: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, ignored: [] } },
    memberLogs: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, ignored: [] } },
    reactionLogs: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, ignored: [] } },
    commandLogs: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, ignored: [] } },

    /** WARNINGS STRUCTURE
     * WARNINGS: ARRAY
     *   - USER_ID: STRING
     *   - TYPE: STRING
     *   - REASON: STRING
     *   - MODERATOR: STRING
     *   - DATE: DATE
     *   - ID: STRING
     *   - EXPIRES: NUMBER
     *   - ACTIVE: BOOLEAN
     */
    warnings: { type: mongoose.SchemaTypes.Mixed, default: [] },

    confessions: { type: mongoose.SchemaTypes.Mixed, default: { channel: null, log: null } },
    ignore: { type: mongoose.SchemaTypes.Mixed, default: { channels: [], roles: [], users: [] } },
    muteRole: { type: mongoose.SchemaTypes.String, default: null },
    commands: { type: mongoose.SchemaTypes.Array, default: [
        { command: 'neko', enabled: false, permissions: { bot: [], user: [], roles: [] }, ignore: { channels: [], roles: [], users: [] }, cooldown: { duration: 0, users: [] }, },
        { command: 'confess', enabled: true, permissions: { bot: [], user: [], roles: [] }, ignore: { channels: [], roles: [], users: [] }, cooldown: { duration: 1000 * 60 * 60 * 6, users: []}, },
    ] },
});

interface antiModSettings {
    channels: string[],
    roles: string[],
    users: string[],
    active: Boolean,
    punishment: punishment,
}

interface antiMayus {
    channels: string[],
    roles: string[],
    users: string[],
    active: Boolean,
    punishment: punishment,
    caps: number,
    min: number,
}
interface antiFlood {
    channels: string[],
    roles: string[],
    users: string[],
    active: Boolean,
    punishment: punishment,
    mps: number,
    seg: number,
}

interface punishment {
    type: string,
    duration: number,
}

interface publication {
    channel: string,
    message: string,
}

interface log {
    channel: string,
    ignored: string[],
}

interface warning {
    user_id: string,
    type: string,
    reason: string,
    moderator: string,
    date: Date,
    id: string,
    expires: number,
    active: Boolean,
}

interface confession {
    channel: string,
    log: string,
}

interface ignore {
    channels: string[],
    roles: string[],
    users: string[],
}

interface userTimestamp {
    id: string,
    start: number,
}

interface command {
    command: string,
    enabled: Boolean,
    permissions: {
        bot: string[],
        user: string[],
        roles: string[],
    },
    ignore: ignore,
    cooldown: {
        duration: number,
        users: userTimestamp[],
    }
}

interface guildObject {
    [key: string]: any;
    guildId: string,
    prefixes: string[],
    antiInvites: antiModSettings,
    antiLinks: antiModSettings,
    antiMayus: antiMayus,
    antiFlood: antiFlood,
    welcomes: publication,
    leaves: publication,
    messageLogs: log,
    mediaLogs: log,
    memberLogs: log,
    reactionLogs: log,
    commandLogs: log,
    warnings: warning[],
    confessions: confession,
    ignore: ignore,
    muteRole: string,
    commands: command[],
}

const model = mongoose.model('guilds', schema);

export { guildObject as GuildObject }
export { model as Guild }
export { antiModSettings as AntiModSettings }
export { punishment as Punishment }
export { publication as Publication }
export { log as Log }
export { warning as Warning }
export { confession as Confession }
export { ignore as Ignore }
export { command as Command }
export { antiMayus as AntiMayus }
export { antiFlood as AntiFlood }