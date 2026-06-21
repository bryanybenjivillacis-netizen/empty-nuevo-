const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const AntiNuke = require("@schemas/AntiNuke");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antinuke")
    .setDescription("🛡️ Configura el sistema AntiNuke de Empty")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub.setName("enable").setDescription("Activa el AntiNuke en este servidor")
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("Desactiva el AntiNuke en este servidor")
    )
    .addSubcommand((sub) =>
      sub.setName("status").setDescription("Ver configuración actual del AntiNuke")
    )
    .addSubcommand((sub) =>
      sub
        .setName("punishment")
        .setDescription("Cambia el castigo para quienes activen el AntiNuke")
        .addStringOption((opt) =>
          opt
            .setName("tipo")
            .setDescription("Tipo de castigo")
            .setRequired(true)
            .addChoices(
              { name: "🔨 Ban", value: "ban" },
              { name: "👢 Kick", value: "kick" },
              { name: "🚫 Strip Roles", value: "strip" },
              { name: "🔇 Deafen + Strip", value: "deafen" }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("logchannel")
        .setDescription("Canal donde se enviarán los logs del AntiNuke")
        .addChannelOption((opt) =>
          opt.setName("canal").setDescription("Canal de logs").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("threshold")
        .setDescription("Cambia el límite de acciones antes de activar el AntiNuke")
        .addStringOption((opt) =>
          opt
            .setName("accion")
            .setDescription("Acción a configurar")
            .setRequired(true)
            .addChoices(
              { name: "Bans", value: "banLimit" },
              { name: "Kicks", value: "kickLimit" },
              { name: "Borrar Canales", value: "channelDeleteLimit" },
              { name: "Crear Canales", value: "channelCreateLimit" },
              { name: "Borrar Roles", value: "roleDeleteLimit" },
              { name: "Crear Roles", value: "roleCreateLimit" },
              { name: "Webhooks", value: "webhookLimit" },
              { name: "Bots Añadidos", value: "botAddLimit" }
            )
        )
        .addIntegerOption((opt) =>
          opt
            .setName("limite")
            .setDescription("Número de acciones en 10 segundos antes de actuar (mínimo 1)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("module")
        .setDescription("Activa o desactiva un módulo específico del AntiNuke")
        .addStringOption((opt) =>
          opt
            .setName("modulo")
            .setDescription("Módulo a cambiar")
            .setRequired(true)
            .addChoices(
              { name: "Anti Ban", value: "antiBan" },
              { name: "Anti Kick", value: "antiKick" },
              { name: "Anti Borrar Canales", value: "antiChannelDelete" },
              { name: "Anti Crear Canales", value: "antiChannelCreate" },
              { name: "Anti Borrar Roles", value: "antiRoleDelete" },
              { name: "Anti Crear Roles", value: "antiRoleCreate" },
              { name: "Anti Webhook", value: "antiWebhook" },
              { name: "Anti Bot Add", value: "antiBotAdd" }
            )
        )
        .addBooleanOption((opt) =>
          opt.setName("estado").setDescription("true = activado, false = desactivado").setRequired(true)
        )
    ),

  async execute(interaction) {
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        content: "❌ Solo el **dueño del servidor** puede configurar el AntiNuke.",
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let config = await AntiNuke.findOne({ guildId });
    if (!config) config = await AntiNuke.create({ guildId });

    // ── ENABLE ──
    if (sub === "enable") {
      config.enabled = true;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ff88")
            .setTitle("🛡️ Empty AntiNuke — Activado")
            .setDescription("El sistema AntiNuke está ahora **activo**. El servidor está protegido.")
            .setThumbnail("attachment://empty.png")
            .setFooter({ text: "Empty Bot", iconURL: "attachment://empty.png" }),
        ],
        ephemeral: true,
      });
    }

    // ── DISABLE ──
    if (sub === "disable") {
      config.enabled = false;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff4444")
            .setTitle("🛡️ Empty AntiNuke — Desactivado")
            .setDescription("El AntiNuke ha sido **desactivado**. El servidor ya no está protegido."),
        ],
        ephemeral: true,
      });
    }

    // ── STATUS ──
    if (sub === "status") {
      const m = config.modules;
      const t = config.thresholds;
      const embed = new EmbedBuilder()
        .setColor(config.enabled ? "#00ff88" : "#ff4444")
        .setTitle("🛡️ Empty AntiNuke — Estado")
        .setThumbnail("attachment://empty.png")
        .addFields(
          {
            name: "Estado General",
            value: config.enabled ? "✅ Activado" : "❌ Desactivado",
            inline: true,
          },
          {
            name: "Castigo",
            value: config.punishment.toUpperCase(),
            inline: true,
          },
          {
            name: "Canal de Logs",
            value: config.logChannel ? `<#${config.logChannel}>` : "No configurado",
            inline: true,
          },
          {
            name: "Módulos",
            value: [
              `${m.antiBan ? "✅" : "❌"} Anti Ban (límite: ${t.banLimit})`,
              `${m.antiKick ? "✅" : "❌"} Anti Kick (límite: ${t.kickLimit})`,
              `${m.antiChannelDelete ? "✅" : "❌"} Anti Borrar Canales (límite: ${t.channelDeleteLimit})`,
              `${m.antiChannelCreate ? "✅" : "❌"} Anti Crear Canales (límite: ${t.channelCreateLimit})`,
              `${m.antiRoleDelete ? "✅" : "❌"} Anti Borrar Roles (límite: ${t.roleDeleteLimit})`,
              `${m.antiRoleCreate ? "✅" : "❌"} Anti Crear Roles (límite: ${t.roleCreateLimit})`,
              `${m.antiWebhook ? "✅" : "❌"} Anti Webhook (límite: ${t.webhookLimit})`,
              `${m.antiBotAdd ? "✅" : "❌"} Anti Bot Add (límite: ${t.botAddLimit})`,
            ].join("\n"),
          },
          {
            name: "Whitelist",
            value:
              config.whitelist.length > 0
                ? config.whitelist.map((id) => `<@${id}>`).join(", ")
                : "Nadie en whitelist",
          }
        )
        .setFooter({ text: "Empty Bot", iconURL: "attachment://empty.png" });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ── PUNISHMENT ──
    if (sub === "punishment") {
      const tipo = interaction.options.getString("tipo");
      config.punishment = tipo;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffaa00")
            .setTitle("🛡️ AntiNuke — Castigo actualizado")
            .setDescription(`El castigo ahora es: **${tipo.toUpperCase()}**`),
        ],
        ephemeral: true,
      });
    }

    // ── LOG CHANNEL ──
    if (sub === "logchannel") {
      const canal = interaction.options.getChannel("canal");
      config.logChannel = canal.id;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00aaff")
            .setTitle("🛡️ AntiNuke — Canal de logs configurado")
            .setDescription(`Los logs se enviarán a ${canal}`),
        ],
        ephemeral: true,
      });
    }

    // ── THRESHOLD ──
    if (sub === "threshold") {
      const accion = interaction.options.getString("accion");
      const limite = interaction.options.getInteger("limite");
      config.thresholds[accion] = limite;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffaa00")
            .setTitle("🛡️ AntiNuke — Límite actualizado")
            .setDescription(`**${accion}** ahora tiene límite de **${limite}** acciones por 10 segundos.`),
        ],
        ephemeral: true,
      });
    }

    // ── MODULE ──
    if (sub === "module") {
      const modulo = interaction.options.getString("modulo");
      const estado = interaction.options.getBoolean("estado");
      config.modules[modulo] = estado;
      await config.save();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(estado ? "#00ff88" : "#ff4444")
            .setTitle("🛡️ AntiNuke — Módulo actualizado")
            .setDescription(`**${modulo}** está ahora ${estado ? "✅ activado" : "❌ desactivado"}.`),
        ],
        ephemeral: true,
      });
    }
  },
};
