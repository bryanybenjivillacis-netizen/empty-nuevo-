const { antiNukeCheck } = require("@handlers/antinuke");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    if (!member.user.bot) return;
    const { guild } = member;
    try {
      const auditLogs = await guild.fetchAuditLogs({ type: 28, limit: 1 }); // BOT_ADD
      const entry = auditLogs.entries.first();
      if (!entry || Date.now() - entry.createdTimestamp > 5000) return;
      const executorId = entry.executor?.id;
      if (!executorId || executorId === guild.client.user.id) return;
      await antiNukeCheck(guild, executorId, "botAdd", `Bot añadido sin autorización (${member.user.tag})`);
    } catch {}
  },
};
