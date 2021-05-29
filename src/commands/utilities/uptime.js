const Command = require("../../struct/command.js");
const moment = require("moment");
require("moment-duration-format");

class UptimeCommand extends Command {
  constructor() {
    super({
      id: "uptime",
      description: "",
      ratelimit: 5,
      category: "utilities",
    });
  }

  async do(message) {
    try {
      const uptime = moment.duration(this.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
      return message.channel.send(`Uptime: ${uptime} with ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of ram usage!`);
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = UptimeCommand;