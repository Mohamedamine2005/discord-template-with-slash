const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");

class NukeCommand extends Command {
  constructor() {
    super({
      id: "nuke",
      description: "Launch a nuke to a certain channel, to vanish all messages.",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_CHANNELS"]
    });
  }

  async do(message) {
    try {
      const res = await this.client.nekoyasui.prompt.reply(message.channel, "Are you sure you want to launch a nuke on this channel?", { userID: message.author.id });
      if (!res) return;

      const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct"];
      if (!(yes.some((str) => res.toLowerCase().includes(str)))) return;
      message.channel.clone({
        name: message.channel.name,
        reason: 'Needed a delete'
      }).then(async (clone) => {
        clone.send(`https://media.giphy.com/media/iZuLdzQ5eoD1C/giphy.gif`);
        return message.channel.delete();
      });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = NukeCommand;