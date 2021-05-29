const Command = require("../../struct/command.js");

class AFKCommand extends Command {
  constructor() {
    super({
      id: "afk",
      description: "",
      ratelimit: 5,
      category: "utilities",
    });
  }

  async do(message) {
    try {
      //Do nothing
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = AFKCommand;