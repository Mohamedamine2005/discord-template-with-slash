class Event {
  /**
   * @param {Object} event event for your events.
   * @param {String} [event.id]
   * @param {Boolean} [event.once]
   * @param {String} [event.emitter]
   * @param {Boolean} [event.enable]
   * @param {Boolean} [event.usedDatabase]
   */
  constructor(event) {
    this.id = event.id || "";
    this.type = event.once || false;
    this.emitter = event.emitter || null;
    this.enable = Boolean(event.enable) || true;
    this.usedDatabase = Boolean(event.usedDatabase) || false;
  }
}

module.exports = Event;