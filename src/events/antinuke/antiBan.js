const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "guildBanAdd",
  async execute(ban) {
    const { guild } = ban;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 22, limit: 1 }); // BAN
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "ban", `Ban masivo detectado (${entry.target?.tag})`);
    } catch {}
  },
};
