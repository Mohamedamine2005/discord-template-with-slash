const SlashEvent = require("../../struct/event.js");

class CreateSlashEvent extends SlashEvent {
  constructor() {
    super({
      id: "SLASH_CREATE",
      once: false,
    });
  }

  // eslint-disable-next-line no-unused-vars
  async do(command, data) {
    //console.log("create interaction!");
  }
}

module.exports = CreateSlashEvent;