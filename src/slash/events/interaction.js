const SlashEvent = require("../../struct/event.js");

class InteractionEvent extends SlashEvent {
  constructor() {
    super({
      id: "SLASH_INTERACTION",
      once: false,
    });
  }

  // eslint-disable-next-line no-unused-vars
  async do(interaction, data) {
    //console.log("interaction!");
  }
}

module.exports = InteractionEvent;