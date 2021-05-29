const Command = require("../../struct/command.js");
const { Util } = require("discord.js");

class EmojiCommand extends Command {
  constructor() {
    super({
      id: "emoji",
      description: "Add emojis in your server.",
      ratelimit: 5,
      category: "administrator",
      clientPermissions: ["MANAGE_EMOJIS"],
      userPermissions: ["MANAGE_EMOJIS"]
    });
  }

  async do(message, [...value]) {
    try {
      let isUrl = require("is-url"), type = "", name = "", link;
      let emote = value.join(" ").match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);
      if (emote) {
        emote = value[0];
        type = "emoji";
        name = value.join(" ").replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi, "").trim().split(" ")[0];
      } else {
        emote = `${value.find((url) => isUrl(url))}`;
        name = value.find((url) => url != emote);
        type = "url";
      }
      let emoji = { name: "" };

      if (type == "emoji") {
        emoji = Util.parseEmoji(emote);
        link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;
      } else {
        if (!name) return message.channel.send("`🚫` Please provide a name!");
        link = message.attachments.first() ? message.attachments.first().url : emote;
      }

      const embed = this.client.BaseEmbed(message);
      embed.setDescription(`**Emoji Has Been Added!** | **Name:** \`${name || `${emoji.name}`}\` | **Preview:** [Click Me](${link})`);
      embed.setColor(this.client.color("green"));

      return message.guild.emojis.create(`${link}`, `${name || `${emoji.name}`}`)
        .then(() => message.channel.send("", { embed : embed }))
        .catch((e) => this.client.nekoyasui.logs(message, e, "error"));
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = EmojiCommand;