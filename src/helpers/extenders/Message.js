const { Message } = require("discord.js");

Message.prototype.succeedEmbed = function (description, options = {}) {
  return this.channel.send({
    embeds: [
      {
        description,
        color: 0x00a56a,
        ...options,
      },
    ],
  });
};

Message.prototype.errorEmbed = function (description, options = {}) {
  return this.channel.send({
    embeds: [
      {
        description,
        color: 0xd61a3c,
        ...options,
      },
    ],
  });
};

Message.prototype.infoEmbed = function (description, options = {}) {
  return this.channel.send({
    embeds: [
      {
        description,
        color: 0x068add,
        ...options,
      },
    ],
  });
};
