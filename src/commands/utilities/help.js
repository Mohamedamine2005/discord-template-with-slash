const Command = require("../../struct/command.js");
const { stripIndents } = require("common-tags");

class HelpCommand extends Command {
  constructor() {
    super({
      id: "help",
      aliases: ["h"],
      category: "utilities",
      description: "",
      ratelimit: 5,
    });
  }

  do(message, [commandName]) {
    const embed = this.client.BaseEmbed(message);
    const command = this.client.commands.get(commandName);
    try {
      if (command) {
        embed.setTitle(command.id.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
        embed.setDescription(stripIndents(`
          **❯ Usage:** ${command.usage ? command.usage : "No usage provided"}
          **❯ Aliases:** ${command.aliases.length ? command.aliases.join(", ") : "N/A"}
          **❯ Description:** ${command.description || "No description provided."}
        `));
      } else {
        const categories = this.removeDuplicates(this.client.commands.map((c) => c.category));
        embed.setDescription(`For additional info on a command, use \`${this.client.prefix}help <command>\``);
        for (const category of categories) {
          let categoryID = category ? `❯ ${category.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}` : "❯ Miscellaneous";
          if (category === "owner" ) continue;
          embed.addField(categoryID, this.client.commands.filter((c) => c.category === category).map((c) => "`" + c.id + "`").join(" "));
        }
      }
      return message.channel.send("", { embed : embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }

  removeDuplicates(arr) {
    return [...new Set(arr)];
  }
}

module.exports = HelpCommand;