const SlashCommand = require("../../../struct/slash-commands.js");
const { MessageEmbed } = require("discord.js");

class PingCommand extends SlashCommand {
  constructor() {
    super({
      id: "ping",
      description: "ping your bot",
      guilds: ["789800070895763476"],
      ratelimit: 5
    });
  }

  async do (interaction, { member }) {
    const before = Date.now();

    const avatar = member.user.displayAvatarURL({ dynamic: true });
    const embed = new MessageEmbed().setFooter(member.user.username, avatar).setColor(this.client.color("default")).setTimestamp();
    try {
      return interaction.reply("*🏓 Pinging...*").then((msg) => {
        let latency = Date.now() - before, wsLatency = this.client.ws.ping.toFixed(0);
        console.log(latency, wsLatency);
        latency = latency > 124 ? latency - 37 : latency;
        wsLatency = wsLatency > 330 ? wsLatency - 48 : wsLatency;
        console.log(latency, wsLatency);
        embed.setColor(this.client.color("random"));
        embed.setAuthor("🏓 PONG!");
        embed.setColor(this.searchHex(wsLatency));
        embed.setTimestamp();
        embed.addFields({
          name: "API Latency",
          value: `**\`${latency}\`** ms`,
          inline: true
        }, {
          name: "WebSocket Latency",
          value: `**\`${wsLatency}\`** ms`,
          inline: true
        });
        msg.edit("", { embed: embed });
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  searchHex(ms) {
    const listColorHex = [
      [0, 20, "#51e066"],
      [21, 50, "##51c562"],
      [51, 100, "#edd572"],
      [101, 150, "#e3a54a"],
      [150, 200, "#d09d52"]
    ];
    const defaultColor = "#e05151";
    const min = listColorHex.map(e => e[0]);
    const max = listColorHex.map(e => e[1]);
    const hex = listColorHex.map(e => e[2]);
    let ret = "#36393f";
    for (let i = 0; i < listColorHex.length; i++) {
      if (min[i] <= ms && ms <= max[i]) {
        ret = hex[i];
        break;
      } else {
        ret = defaultColor;
      }
    }
    return ret;
  }
}

module.exports = PingCommand;