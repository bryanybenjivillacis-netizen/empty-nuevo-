const AntiNuke = require("@schemas/AntiNuke");

// In-memory tracker for fast action (no DB delay on checks)
// Structure: { guildId: { userId: { action: count, lastReset: timestamp } } }
const actionTracker = new Map();
const WINDOW_MS = 10000; // 10 second rolling window

/**
 * Get or create tracker entry for a user in a guild
 */
function getTracker(guildId, userId) {
  if (!actionTracker.has(guildId)) actionTracker.set(guildId, new Map());
  const guild = actionTracker.get(guildId);
  if (!guild.has(userId)) guild.set(userId, { counts: {}, lastReset: Date.now() });
  const entry = guild.get(userId);

  // Reset if window expired
  if (Date.now() - entry.lastReset > WINDOW_MS) {
    entry.counts = {};
    entry.lastReset = Date.now();
  }
  return entry;
}

/**
 * Track an action and return true if threshold exceeded
 * @param {string} guildId
 * @param {string} userId
 * @param {string} action - e.g. "ban", "channelDelete"
 * @param {number} limit
 */
function trackAction(guildId, userId, action, limit) {
  const entry = getTracker(guildId, userId);
  entry.counts[action] = (entry.counts[action] || 0) + 1;
  return entry.counts[action] >= limit;
}

/**
 * Apply punishment to a member
 */
async function punish(guild, userId, reason, punishment, logChannel) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    // Don't punish bots with higher permissions or server owner
    if (member.id === guild.ownerId) return;
    if (!member.manageable) return;

    switch (punishment) {
      case "ban":
        await guild.members.ban(userId, { reason: `[Empty AntiNuke] ${reason}` });
        break;
      case "kick":
        await member.kick(`[Empty AntiNuke] ${reason}`);
        break;
      case "strip":
        await member.roles.set([], `[Empty AntiNuke] ${reason}`);
        break;
      case "deafen":
        if (member.voice?.channel) await member.voice.setDeaf(true, `[Empty AntiNuke] ${reason}`);
        await member.roles.set([], `[Empty AntiNuke] ${reason}`);
        break;
    }

    // Log it
    if (logChannel) {
      const channel = guild.channels.cache.get(logChannel);
      if (channel) {
        const { EmbedBuilder } = require("discord.js");
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("🛡️ Empty AntiNuke — Acción Tomada")
          .addFields(
            { name: "Usuario", value: `<@${userId}> (${userId})`, inline: true },
            { name: "Castigo", value: punishment.toUpperCase(), inline: true },
            { name: "Razón", value: reason }
          )
          .setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  } catch (err) {
    console.error(`[AntiNuke] Error applying punishment: ${err.message}`);
  }
}

/**
 * Main check function — call this from every event
 * @param {Guild} guild
 * @param {string} executorId - the user who did the action
 * @param {string} action - action key (e.g. "ban", "channelDelete")
 * @param {string} reason - human reason for log
 * @returns {Promise<boolean>} - true if punished
 */
async function antiNukeCheck(guild, executorId, action, reason) {
  if (!guild || !executorId) return false;

  // Fetch config (cached by mongoose)
  const config = await AntiNuke.findOne({ guildId: guild.id }).lean();
  if (!config || !config.enabled) return false;

  // Check whitelist
  if (config.whitelist.includes(executorId)) return false;

  // Check module enabled
  const moduleMap = {
    ban: "antiBan",
    kick: "antiKick",
    channelDelete: "antiChannelDelete",
    channelCreate: "antiChannelCreate",
    roleDelete: "antiRoleDelete",
    roleCreate: "antiRoleCreate",
    webhook: "antiWebhook",
    botAdd: "antiBotAdd",
    memberUpdate: "antiMemberUpdate",
  };
  const moduleName = moduleMap[action];
  if (moduleName && config.modules[moduleName] === false) return false;

  // Get threshold
  const thresholdMap = {
    ban: config.thresholds.banLimit,
    kick: config.thresholds.kickLimit,
    channelDelete: config.thresholds.channelDeleteLimit,
    channelCreate: config.thresholds.channelCreateLimit,
    roleDelete: config.thresholds.roleDeleteLimit,
    roleCreate: config.thresholds.roleCreateLimit,
    webhook: config.thresholds.webhookLimit,
    botAdd: config.thresholds.botAddLimit,
    memberUpdate: config.thresholds.memberUpdateLimit,
  };
  const limit = thresholdMap[action] ?? 3;

  const exceeded = trackAction(guild.id, executorId, action, limit);
  if (!exceeded) return false;

  // Reset tracker immediately to avoid double-punishment
  const guildTracker = actionTracker.get(guild.id);
  if (guildTracker) guildTracker.delete(executorId);

  await punish(guild, executorId, reason, config.punishment, config.logChannel);
  return true;
}

module.exports = { antiNukeCheck };
