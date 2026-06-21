const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const { guild } = member;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 20, limit: 1 }); // KICK
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      if (entry.target?.id !== member.id) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "kick", `Kick masivo detectado (${member.user?.tag})`);
    } catch {}
  },
};
