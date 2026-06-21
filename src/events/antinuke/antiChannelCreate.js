const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "channelCreate",
  async execute(channel) {
    const { guild } = channel;
    if (!guild) return;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 10, limit: 1 }); // CHANNEL_CREATE
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "channelCreate", `Creación masiva de canales (#${channel.name})`);
    } catch {}
  },
};
