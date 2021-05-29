class Command {
/**
 * @param {Object} command command for your commands.
 * @param {String} [command.id]
 * @param {Array} [command.aliases]
 * @param {String} [command.description]
 * @param {Array} [command.usage]
 * @param {String} [command.category]
 * @param {Boolean} [command.guildOnly]
 * @param {Boolean} [command.ownerOnly]
 * @param {Number} [command.ratelimit]
 * @param {Array} [command.userPermissions]
 * @param {Array} [command.clientPermissions]
 * @param {Array} [command.examples]
 * @param {Boolean} [command.enable]
 * @param {Boolean} [command.usedDatabase]
 */
  constructor(command) {
    this.id = command.id || "";
    this.aliases = command.aliases || [];
    this.description = command.description || null;
    this.usage = command.usage || [];
    this.category = command.category || null;
    this.guildOnly = Boolean(command.guildOnly) || true;
    this.ownerOnly = Boolean(command.ownerOnly) || false;
    this.ratelimit = Number(command.ratelimit) || 0;
    this.userPermissions = command.userPermissions || [];
    this.clientPermissions = command.clientPermissions || ["SEND_MESSAGES", "EMBED_LINKS"];
    this.examples = command.examples || [];
    this.enable = Boolean(command.enable) || true;
    this.usedDatabase = Boolean(command.usedDatabase) || false;
  }
}

module.exports = Command;