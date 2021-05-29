const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");

class UnmuteCommand extends Command {
  constructor() {
    super({
      id: "unmute",
      description: "Unmute a member, i feel bad for him.",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_ROLES"]
    });
  }

  async do(message, [member, ...reasons]) {
    try {
      if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to unmute?", { userID: message.author.id });
      if (!member) return;

      member = await this.client.nekoyasui.search.member(message, member, { current: true });
      if (!member) return message.channel.send("`🚫` That member cannot be found on this server.");
      if (!(member.roles.cache.find((role) => role.name === "muted"))) return message.channel.send("`🚫` This user is already unmuted.");

      let reasone = reasons.join(" ");
      if (!reasone) reasone = await this.client.nekoyasui.prompt.reply(message.channel, "Tell me your reason, why you want to unmute him?", { userID: message.author.id });

      let options = {};
      const reason = reasone ? reasone : null;
      if (reason) options.reason = reason;

      const mutedRole = await this.findOrCreateMutedRole(message.guild);
      this.removeMuteChannelPerms(message.guild, member.id);

      member.roles.remove(mutedRole);

      const embed = new MessageEmbed();
      embed.setColor(this.client.color("green"));
      embed.setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }));
      embed.setDescription(`\`🔊\` __Member unmuted from **${message.guild.name}**__\n\n` + [
        `**❯ Target** • ${member.user.tag} (${member.id})`,
        `**❯ Unmuted by** • ${message.author.tag} (${message.author.id})`,
        `**❯ Reason** • ${reason ? reason : "Not Specified"}`
      ].join("\n"));
      embed.setFooter(`Moderation system powered by ${this.client.user.username}`, this.client.user.displayAvatarURL);
      embed.setTimestamp();

      return message.channel.send("", { embed: embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }

  async removeMuteChannelPerms(guild, memberID) {
    await guild.channels.cache.forEach((channel) => {
      new Promise(resolve => setTimeout(resolve, 500));
      channel.permissionOverwrites.get(memberID).delete();
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

module.exports = UnmuteCommand;