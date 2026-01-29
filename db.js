const Database = require('better-sqlite3');
const db = new Database('config.db');

// Tables:
// guild_channel → stores notification channel per guild
// streamers     → stores multiple streamers per guild

db.prepare(`
    CREATE TABLE IF NOT EXISTS guild_channel (
        guild_id TEXT PRIMARY KEY,
        notify_channel_id TEXT
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS streamers (
        guild_id TEXT,
        twitch_username TEXT,
        PRIMARY KEY (guild_id, twitch_username)
    )
`).run();

function setNotifyChannel(guildId, channelId) {
    db.prepare(`
        INSERT INTO guild_channel (guild_id, notify_channel_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET notify_channel_id=excluded.notify_channel_id
    `).run(guildId, channelId);
}

function addStreamer(guildId, username) {
    db.prepare(`
        INSERT OR IGNORE INTO streamers (guild_id, twitch_username)
        VALUES (?, ?)
    `).run(guildId, username.toLowerCase());
}

function removeStreamer(guildId, username) {
    db.prepare(`
        DELETE FROM streamers
        WHERE guild_id = ? AND twitch_username = ?
    `).run(guildId, username.toLowerCase());
}

function getStreamers(guildId) {
    return db.prepare(`SELECT twitch_username FROM streamers WHERE guild_id = ?`).all(guildId);
}

function getAllConfigs() {
    const streamersByGuild = {};
    const streamerRows = db.prepare(`SELECT * FROM streamers`).all();
    for (const row of streamerRows) {
        if (!streamersByGuild[row.guild_id]) streamersByGuild[row.guild_id] = [];
        streamersByGuild[row.guild_id].push(row.twitch_username);
    }

    const channelRows = db.prepare(`SELECT * FROM guild_channel`).all();
    const configs = [];

    for (const row of channelRows) {
        configs.push({
            guild_id: row.guild_id,
            notify_channel_id: row.notify_channel_id,
            streamers: streamersByGuild[row.guild_id] || [],
        });
    }

    return configs;
}

function getChannel(guildId) {
    const row = db.prepare(`SELECT notify_channel_id FROM guild_channel WHERE guild_id = ?`).get(guildId);
    return row?.notify_channel_id ?? null;
}

// Create mod_roles table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS mod_roles (
    guild_id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL
  )
`).run();

function setModRole(guildId, roleId) {
  db.prepare(`
    INSERT INTO mod_roles (guild_id, role_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET role_id = excluded.role_id
  `).run(guildId, roleId);
}

function getModRole(guildId) {
  const row = db.prepare(`
    SELECT role_id FROM mod_roles WHERE guild_id = ?
  `).get(guildId);
  return row?.role_id ?? null;
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS verification_settings (
    guild_id TEXT PRIMARY KEY,
    verification_channel_id TEXT,
    verification_message_id TEXT,
    member_role_id TEXT
  )
`).run();

function setVerificationSettings(guildId, channelId, messageId, memberRoleId = null) {
    db.prepare(`
        INSERT INTO verification_settings (guild_id, verification_channel_id, verification_message_id, member_role_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET
            verification_channel_id = excluded.verification_channel_id,
            verification_message_id = excluded.verification_message_id,
            member_role_id = excluded.member_role_id
    `).run(guildId, channelId, messageId, memberRoleId);
}

function getVerificationSettings(guildId) {
    return db.prepare(`SELECT * FROM verification_settings WHERE guild_id = ?`).get(guildId);
}

function setMemberRole(guildId, roleId) {
    db.prepare(`
        INSERT INTO verification_settings (guild_id, member_role_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET member_role_id = excluded.member_role_id
    `).run(guildId, roleId);
}

// db.js (add at the bottom)
function setWelcomeChannel(guildId, channelId) {
    db.prepare(`
        INSERT INTO welcome_settings (guild_id, welcome_channel_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET welcome_channel_id = excluded.welcome_channel_id
    `).run(guildId, channelId);
}

function getWelcomeChannel(guildId) {
    const row = db.prepare(`SELECT welcome_channel_id FROM welcome_settings WHERE guild_id = ?`).get(guildId);
    return row ? row.welcome_channel_id : null;
}

// Also add table creation line:
db.prepare(`
  CREATE TABLE IF NOT EXISTS welcome_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel_id TEXT
  )
`).run();

module.exports = {
    setNotifyChannel,
    addStreamer,
    removeStreamer,
    getStreamers,
    getAllConfigs,
    getChannel,
    setModRole,
    getModRole,
    setVerificationSettings,
    getVerificationSettings,
    setMemberRole,
    setWelcomeChannel,
    getWelcomeChannel
};
