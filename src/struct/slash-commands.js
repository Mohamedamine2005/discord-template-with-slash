class SlashCommand {
  /**
   * @param {Object} slash slash for your commands.
   * @param {String} [slash.id]
   * @param {String} [slash.description]
   * @param {Array} [slash.guilds]
   * @param {Boolean} [command.ownerOnly]
   * @param {Number} [command.ratelimit]
   * @param {Array} [command.userPermissions]
   * @param {Array} [command.clientPermissions]
   * @param {Boolean} [command.enable]
   * @param {Boolean} [command.usedDatabase]
   */
  constructor(slash) {
    this.id = slash.id || "";
    this.description = slash.description || "No description provided.";
    this.options = slash.options || [];
    this.guilds = slash.guilds || null;
    this.ownerOnly = Boolean(slash.ownerOnly) || false;
    this.ratelimit = Number(slash.ratelimit) || 0;
    this.userPermissions = slash.userPermissions || [];
    this.clientPermissions = slash.clientPermissions || ["SEND_MESSAGES", "EMBED_LINKS"];
    this.enable = Boolean(slash.enable) || true;
    this.usedDatabase = Boolean(slash.usedDatabase) || false;
  }
}

module.exports = SlashCommand;