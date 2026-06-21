const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const AntiNuke = require("@schemas/AntiNuke");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antinuke-whitelist")
    .setDescription("🛡️ Gestiona la whitelist del AntiNuke")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Añade un usuario a la whitelist (no será castigado)")
        .addUserOption((opt) =>
          opt.setName("usuario").setDescription("Usuario a añadir").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Quita un usuario de la whitelist")
        .addUserOption((opt) =>
          opt.setName("usuario").setDescription("Usuario a quitar").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Ver todos los usuarios en la whitelist")
    ),

  async execute(interaction) {
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        content: "❌ Solo el **dueño del servidor** puede gestionar la whitelist.",
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let config = await AntiNuke.findOne({ guildId });
    if (!config) config = await AntiNuke.create({ guildId });

    if (sub === "add") {
      const user = interaction.options.getUser("usuario");
      if (config.whitelist.includes(user.id)) {
        return interaction.reply({ content: `⚠️ ${user} ya está en la whitelist.`, ephemeral: true });
      }
      config.whitelist.push(user.id);
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ff88")
            .setTitle("✅ Whitelist — Usuario añadido")
            .setDescription(`${user} ha sido añadido a la whitelist del AntiNuke.`),
        ],
        ephemeral: true,
      });
    }

    if (sub === "remove") {
      const user = interaction.options.getUser("usuario");
      if (!config.whitelist.includes(user.id)) {
        return interaction.reply({ content: `⚠️ ${user} no está en la whitelist.`, ephemeral: true });
      }
      config.whitelist = config.whitelist.filter((id) => id !== user.id);
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff4444")
            .setTitle("🗑️ Whitelist — Usuario removido")
            .setDescription(`${user} ha sido removido de la whitelist.`),
        ],
        ephemeral: true,
      });
    }

    if (sub === "list") {
      const list =
        config.whitelist.length > 0
          ? config.whitelist.map((id, i) => `${i + 1}. <@${id}> (${id})`).join("\n")
          : "La whitelist está vacía.";
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🛡️ AntiNuke — Whitelist")
            .setDescription(list),
        ],
        ephemeral: true,
      });
    }
  },
};
