const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "roleCreate",
  async execute(role) {
    const { guild } = role;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 30, limit: 1 }); // ROLE_CREATE
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "roleCreate", `Creación masiva de roles (@${role.name})`);
    } catch {}
  },
};
