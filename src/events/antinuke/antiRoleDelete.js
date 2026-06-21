const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "roleDelete",
  async execute(role) {
    const { guild } = role;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 32, limit: 1 }); // ROLE_DELETE
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "roleDelete", `Eliminación masiva de roles (@${role.name})`);
    } catch {}
  },
};
