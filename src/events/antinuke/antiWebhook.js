const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "webhookUpdate",
  async execute(channel) {
    const { guild } = channel;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 50, limit: 1 }); // WEBHOOK_CREATE
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "webhook", `Creación masiva de webhooks en #${channel.name}`);
    } catch {}
  },
};
