const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

class UnbanCommand extends Command {
  constructor() {
    super({
      id: "unban",
      description: "Unban a member, kami-sama has been forgiven him",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"]
    });
  }

  async do(message, [member, ...reasons]) {
    if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose user that you want to unban? (User ID)", { userID: message.author.id });
    if (!member) return;

    try {
      if (!(member.match(/\d{16,22}$/gi))) return message.channel.send("`🚫` You must supply a User Resolvable, such as a user id.");
      if (!(this.client.nekoyasui.search.user(message, member))) return message.channel.send("`🚫` That user cannot be found, maybe try searching for something that exists.");
      const banned = await message.guild.members.unban(member);
      if (!banned) return message.channel.send("`🚫` This user is not banned on this server.");

      let reasone = reasons.join(" ");
      if (!reasone) reasone = await this.client.nekoyasui.prompt.reply(message.channel, "Tell me your reason, why you want to unban him?", { userID: message.author.id });

      const reason = reasone ? reasone : null;
      member = await this.client.nekoyasui.search.user(message, member);
      let image = await fetch(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.gif?size=4096`).catch(() => null);
      if (!(image.status === 200)) image = await fetch(`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=4096`).catch(() => null);
      const avatar = image ? image.url :
        member.discriminator.endsWith(`0`) || member.discriminator.endsWith(`5`) ? `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png` : member.discriminator.endsWith(`1`) || member.discriminator.endsWith(`6`) ? `https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png` : member.discriminator.endsWith(`2`) || member.discriminator.endsWith(`7`) ? `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png` : member.discriminator.endsWith(`3`) || member.discriminator.endsWith(`8`) ? `https://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png` : member.discriminator.endsWith(`4`) || member.discriminator.endsWith(`9`) ? `https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png` : `Not Available`;

      const embed = new MessageEmbed();
      embed.setColor(this.client.color("green"));
      embed.setThumbnail(avatar);
      embed.setDescription(`\`🔨\` __Member unbanned from **${message.guild.name}**__\n\n` + [
        `**❯ Target** • ${member.username}#${member.discriminator} (${member.id})`,
        `**❯ Unbanned by** • ${message.author.tag} (${message.author.id})`,
        `**❯ Reason** • ${reason ? reason : "Not Specified"}`
      ].join("\n"));
      embed.setFooter(`Moderation system powered by ${this.client.user.username}`, this.client.user.displayAvatarURL);
      embed.setTimestamp();

      return message.channel.send("", { embed: embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = UnbanCommand;