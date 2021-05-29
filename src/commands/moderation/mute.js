const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");

class MuteCommand extends Command {
  constructor() {
    super({
      id: "mute",
      description: "Mute a member, so annoying",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_ROLES"]
    });
  }

  async do(message, [member, ...reasons]) {
    try {
      if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to mute?", { userID: message.author.id });
      if (!member) return;

      member = await this.client.nekoyasui.search.member(message, member, { current: true });
      if (!member) return message.channel.send("`🚫` That member cannot be found on this server.");
      if (member.id === message.author.id) return message.channel.send("`🚫` Why would you mute yourself?");
      if (member.id === this.client.user.id) return message.channel.send("`🚫` Why would you mute me?");
      if (member.id === message.guild.ownerID) return message.channel.send("`🚫` You can't mute the owner.");
      if (member.roles.cache.find((role) => role.name === "muted")) return message.channel.send("`🚫` This user is already muted.");
      if (!(message.author.id === message.guild.ownerID) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("`🚫` You cannot mute this user.");
      if (member.hasPermission("MANAGE_ROLES")) return message.channel.send("`🚫` I cannot mute this user.");

      let reasone = reasons.join(" ");
      if (!reasone) reasone = await this.client.nekoyasui.prompt.reply(message.channel, "Tell me your reason, why you want to mute him?", { userID: message.author.id });

      let options = {};
      const reason = reasone ? reasone : null;
      if (reason) options.reason = reason;

      const mutedRole = await this.findOrCreateMutedRole(message.guild);
      this.updateMuteChannelPerms(message.guild, member.id, {
        SEND_MESSAGES: false,
        ADD_REACTIONS: false,
        READ_MESSAGE_HISTORY: false,
        CONNECT: false,
      });

      member.roles.add(mutedRole);

      const lastMessage = message.guild.member(member).lastMessageID;
      const embed = new MessageEmbed();
      embed.setColor(this.client.color("orange"));
      embed.setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }));
      embed.setDescription(`\`🔇\` __Member muted from **${message.guild.name}**__\n\n` + [
        `**❯ Target** • ${member.user.tag} (${member.id})`,
        `**❯ Issued by** • ${message.author.tag} (${message.author.id})`,
        `**❯ Reason** • ${reason ? reason : "Not Specified"}`,
        `**❯ Last message** • ${lastMessage ? lastMessage : "Not Specified"}`
      ].join("\n"));
      embed.setFooter(`Moderation system powered by ${this.client.user.username}`, this.client.user.displayAvatarURL);
      embed.setTimestamp();

      return message.channel.send("", { embed: embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }

  async updateMuteChannelPerms(guild, memberID, permissions) {
    await guild.channels.cache.forEach((channel) => {
      new Promise(resolve => setTimeout(resolve, 500));
      channel.updateOverwrite(memberID, permissions).catch((e) => {
        this.client.Log().error("Muted User", `${e.name}: ${e.stack}`);
      });
    });
  }

  async findOrCreateMutedRole(guild) {
    const role = guild.roles.cache.find((role) => role.name === "muted");
    role.setPosition(1);

    return (
      guild.roles.cache.find((role) => role.name === "muted") ||
      (await guild.roles.create({
        data: {
          name: "muted",
          color: this.client.color("default"),
          position: 1
        },
        reason: "Mute a user",
      }))
    );
  }
}

module.exports = MuteCommand;