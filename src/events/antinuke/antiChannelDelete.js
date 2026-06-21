const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "channelDelete",
  async execute(channel) {
    const { guild } = channel;
    if (!guild) return;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 12, limit: 1 }); // CHANNEL_DELETE
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "channelDelete", `Eliminación masiva de canales (#${channel.name})`);
    } catch {}
  },
};
