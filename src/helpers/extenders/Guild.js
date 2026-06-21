const { Guild } = require("discord.js");

Guild.prototype.getSettings = async function () {
  const { getSettings } = require("@schemas/Guild");
  return getSettings(this);
};

Guild.prototype.sendEmbed = async function (channelId, embedData) {
  const channel = this.channels.cache.get(channelId);
  if (!channel) return;
  return channel.send({ embeds: [embedData] });
};
