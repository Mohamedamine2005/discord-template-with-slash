const Command = require("../../struct/command.js");
const ms = require("ms");

class SlowmodeCommand extends Command {
  constructor() {
    super({
      id: "slowmode",
      description: "Slowmode a certain channel, to ratelimit a member.",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
    });
  }

  async do(message, [channel, time]) {
    try {
      if (!channel) channel = await this.client.nekoyasui.prompt.reply(message.channel, "Where would you like to start the slow mode?", { userID: message.author.id });
      if (!channel) return;
      channel = await this.client.nekoyasui.search.channel(message, channel, { current: true });
      if (!channel) return message.channel.send("`🚫` That channel cannot be found on this server.");
      if (!time) time = await this.client.nekoyasui.prompt.reply(message.channel, "Please enter the slow mode duration! Usage: Number(s|m|h|d|w)", { userID: message.author.id });
      if (!time) return;

      const type = phrase => {
        if (phrase === undefined || !phrase.length) return undefined;
        if (ms(phrase) === 0 || ms(phrase) > 1000) return ms(phrase);
        let parsedTime = 0;
        const words = phrase.split(" ");
        for (const word of words) {
          if (ms(word) === 0 || ms(word) > 1000) parsedTime += ms(word);
          else return undefined;
        }
        return parsedTime;
      }
      time = type(time);
      if (!(isNaN(time)) && time >= 21600000) return message.channel.send("`🚫` You can't slowmode more than 6 hours.")
      return channel.setRateLimitPerUser(time / 1000).then(() => message.channel.send(`\`🍇\` ${time ? `Slow mode has been set in ${channel} for ${this.msToTime(time)}` : `Slow mode has been cleared in ${channel}`}.`)).catch((e) => this.client.nekoyasui.logs(message, e, "error"));

    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }

  msToTime(ms) {
    const days = Math.floor(ms / 86400000); // 24*60*60*1000
    const daysms = ms % 86400000; // 24*60*60*1000
    const hours = Math.floor(daysms / 3600000); // 60*60*1000
    const hoursms = ms % 3600000; // 60*60*1000
    const minutes = Math.floor(hoursms / 60000); // 60*1000
    const minutesms = ms % 60000; // 60*1000
    const sec = Math.floor(minutesms / 1000);

    let str = '';
    if (days) str = `${str + days}d`;
    if (hours) str = `${str + hours}h`;
    if (minutes) str = `${str + minutes}m`;
    if (sec) str = `${str + sec}s`;

    return str;
  }
}

module.exports = SlowmodeCommand;