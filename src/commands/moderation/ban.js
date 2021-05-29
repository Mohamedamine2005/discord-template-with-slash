const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");

class BanCommand extends Command {
  constructor() {
    super({
      id: "ban",
      description: "Ban a member, ofc.. it's really good.",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"]
    });
  }

  async do(message, [member, ...reasons]) {
    try {
      if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to ban?", { userID: message.author.id });
      if (!member) return;

      member = await this.client.nekoyasui.search.member(message, member, { current: true });
      if (!member) return message.channel.send("`🚫` That member cannot be found on this server.");
      if (member.id === message.author.id) return message.channel.send("`🚫` Why would you ban yourself?");
      if (member.id === this.client.user.id) return message.channel.send("`🚫` Why would you ban me?");
      if (member.id === message.guild.ownerID) return message.channel.send("`🚫` You can't ban the owner.");
      if (!(message.author.id === message.guild.ownerID) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("`🚫` You cannot ban this user.");
      if (!member.bannable || member.hasPermission("BAN_MEMBERS")) return message.channel.send("`🚫` I cannot ban this user.");

      let reasone = reasons.join(" ");
      if (!reasone) reasone = await this.client.nekoyasui.prompt.reply(message.channel, "Tell me your reason, why you want to ban him?", { userID: message.author.id });

      let options = {};
      const reason = reasone ? reasone : null;
      if (reason) options.reason = reason;

      await member.ban(options);

      const lastMessage = message.guild.member(member).lastMessageID;
      const embed = new MessageEmbed();
      embed.setColor(this.client.color("orange"));
      embed.setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }));
      embed.setDescription(`\`🔨\` __Member banned from **${message.guild.name}**__\n\n` + [
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
}

module.exports = BanCommand;