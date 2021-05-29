const Command = require("../../struct/command.js");
const { MessageEmbed } = require("discord.js");
const { prompt } = require("nekoyasui");

class EmbedCommand extends Command {
  constructor() {
    super({
      id: "embed",
      description: "Create your own embed.",
      ratelimit: 5,
      category: "administrator",
      clientPermissions: ["ADMINISTRATOR"],
      userPermissions: ["ADMINISTRATOR"]
    });
  }

  async do(message) {
    try {
      var ask = {};
      ask.continue = "Do you want to continue to setup your embed?";
      ask.title = "OKay, first of all, what do you want to be the embed's title?";
      ask.desc = "Type the description that you want in the embed!";
      ask.color = "Type the color you want to be on the embed! It can be a color like red or a hex code.";
      ask.footer = "What do you want its footer to be?";
      ask.note = "To cancel the command type: `cancel` | To skip the question type: `skip`";

      var answer = {};
      answer.cancel = "ok! cancelling the embed..";
      answer.skip = "skipping the question, proceed to the next question.";
      answer.yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct"];

      answer.continue = await prompt.reply(message.channel, ask.continue, { userID: message.author.id });
      if (!(answer.continue || answer.yes.some((str) => answer.continue.toLowerCase().includes(str)))) return message.channel.send(answer.cancel);

      answer.title = await prompt.reply(message.channel, ask.title + "\n" + ask.note, { userID: message.author.id });
      if (answer.title === "skip") {
        const skip = await message.channel.send(answer.skip);
        setTimeout(async () => { await skip.delete(); }, 9e3);
      }
      if (!answer.title || answer.title === "cancel") return message.channel.send(answer.cancel);

      answer.desc = await prompt.reply(message.channel, ask.desc + "\n" + ask.note, { userID: message.author.id });
      if (answer.desc === "skip") {
        const skip = await message.channel.send(answer.skip);
        setTimeout(async () => { await skip.delete(); }, 9e3);
      }
      if (!answer.desc || answer.desc === "cancel") return message.channel.send(answer.cancel);

      answer.color = await prompt.reply(message.channel, ask.color + "\n" + ask.note, { userID: message.author.id });
      if (answer.color === "skip") {
        const skip = await message.channel.send(answer.skip);
        setTimeout(async () => { await skip.delete(); }, 9e3);
      }
      if (!answer.color || answer.color === "cancel") return message.channel.send(answer.cancel);

      answer.footer = await prompt.reply(message.channel, ask.footer + "\n" + ask.note, { userID: message.author.id });
      if (answer.footer === "skip") {
        const skip = await message.channel.send(answer.skip);
        setTimeout(async () => { await skip.delete(); }, 9e3);
      }
      if (!answer.footer || answer.footer === "cancel") return message.channel.send(answer.cancel);

      const embed = new MessageEmbed();
      if (answer.title !== "skip") embed.setTitle(answer.title);
      if (answer.desc !== "skip") embed.setDescription(answer.desc);
      if (answer.color !== "skip") embed.setColor(this.client.color(answer.color));
      if (answer.footer !== "skip") embed.setFooter(answer.footer);

      return message.channel.send("", { embed : embed });
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = EmbedCommand;