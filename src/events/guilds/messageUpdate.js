const Event = require("../../struct/event.js");

class MessageUpdateEvent extends Event {
  constructor() {
    super({
      id: "messageUpdate",
      once: false,
    });
  }

  async do(_, newMessage) {
    if (newMessage.partial) await newMessage.fetch();
    this.client.emit("message", newMessage, false);
  }
}

module.exports = MessageUpdateEvent;