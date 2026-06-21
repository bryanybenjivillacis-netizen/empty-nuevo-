const { Schema, model } = require("mongoose");

const antiNukeSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  logChannel: { type: String, default: null },

  // Whitelisted users (won't be punished)
  whitelist: { type: [String], default: [] },

  // Whitelisted roles (won't be punished)
  whitelistRoles: { type: [String], default: [] },

  // Punishment: "ban" | "kick" | "strip" | "deafen"
  punishment: { type: String, default: "ban" },

  // Thresholds (actions per 10 seconds before trigger)
  thresholds: {
    banLimit: { type: Number, default: 3 },
    kickLimit: { type: Number, default: 3 },
    channelDeleteLimit: { type: Number, default: 3 },
    channelCreateLimit: { type: Number, default: 3 },
    roleDeleteLimit: { type: Number, default: 3 },
    roleCreateLimit: { type: Number, default: 3 },
    webhookLimit: { type: Number, default: 2 },
    botAddLimit: { type: Number, default: 1 },
    memberUpdateLimit: { type: Number, default: 5 },
  },

  // Toggle individual modules
  modules: {
    antiBan: { type: Boolean, default: true },
    antiKick: { type: Boolean, default: true },
    antiChannelDelete: { type: Boolean, default: true },
    antiChannelCreate: { type: Boolean, default: true },
    antiRoleDelete: { type: Boolean, default: true },
    antiRoleCreate: { type: Boolean, default: true },
    antiWebhook: { type: Boolean, default: true },
    antiBotAdd: { type: Boolean, default: true },
    antiMemberUpdate: { type: Boolean, default: true },
  },
});

module.exports = model("AntiNuke", antiNukeSchema);
