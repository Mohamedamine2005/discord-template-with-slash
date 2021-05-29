const Command = require("../../struct/command.js");

class NicknameCommand extends Command {
  constructor() {
    super({
      id: "nickname",
      description: 'Assigns a nickname to a member! Use "clear" or leave it blank to remove the nickname!',
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_NICKNAMES"],
      userPermissions: ["MANAGE_NICKNAMES"]
    });
  }

  async do(message, [member, ...nickname]) {
    try {
      if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to change nickname?", { userID: message.author.id });
      if (!member) return;

      member = await this.client.nekoyasui.search.member(message, member, { current: true });
      if (!member) return message.channel.send("`🚫` That member cannot be found on this server.");
      if (member.id === message.author.id) return message.channel.send("`🚫` I wouldn't dare nickname you!");
      if (member.id === this.client.user.id) return message.channel.send("`🚫` Please don't nickname me!");
      if (member.id === message.guild.ownerID) return message.channel.send("`🚫` You can't add nickname the guild owner.");
      //if (member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("`🚫` You can't add nickname on this user.");
      if (!member.bannable) return message.channel.send(`\`🚫\` I can't nickname **${member.user.username}**! Their role is higher than mine!`);

      nickname = nickname.join(" ").trim();
      if (!nickname) nickname = await this.client.nekoyasui.prompt.reply(message.channel, "What nickname do you want to assign?", { userID: message.author.id });
      if (!nickname) return;

      return await nickname !== "clear" ? member.setNickname(nickname).then(() => message.channel.send(`\`🍇\` The nickname **${nickname}** has been assigned to **${member.user.username}**!`)) : member.setNickname("").then(() => message.channel.send(`\`🍇\` **${member.displayName}**'s nickname has been cleared!`));
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = NicknameCommand;