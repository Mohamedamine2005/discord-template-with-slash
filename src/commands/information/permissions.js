const Command = require("../../struct/command.js");

class PermissionsCommand extends Command {
  constructor() {
    super({
      id: "permissions",
      description: "",
      ratelimit: 5,
      category: "information",
    });
  }

  async do(message, [member]) {
    try {
      if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to check permissions?", { userID: message.author.id });
      if (!member) return;

      member = await this.client.nekoyasui.search.member(message, member, { current: true });
      const sp = member.permissions.serialize();
      const cp = message.channel.permissionsFor(member).serialize();

      const embed = this.client.BaseEmbed(message);
      embed.setColor(member.displayColor || this.client.color("default"));
      embed.setTitle(`${member.displayName}'s Permissions`);
      embed.setDescription([
        "\\♨️ - This Server",
        "\\#️⃣ - The Current Channel",
        "```properties",
        "♨️ | #️⃣ | Permission",
        "========================================",
        `${Object.keys(sp).map((perm) => [
          sp[perm] ? "✔️ |" : "❌ |",
          cp[perm] ? "✔️ |" : "❌ |",
          perm.split("_").map((x) => x[0] + x.slice(1).toLowerCase()).join(" ")
        ].join(" ")).join("\n")}`,
        "```"
      ].join("\n"));

      return message.channel.send("", { embed: embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = PermissionsCommand;