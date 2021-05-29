const Event = require("../../struct/event.js");

class MutedRoleEvent extends Event {
  constructor() {
    super({
      id: "channelCreate",
      once: false,
    });
  }

  async do(channel) {
    if (channel.type !== "text") return;
    const mutedRole = await this.findOrCreateMutedRole(channel.guild);

    this.updateMuteChannelPerms(channel.guild, mutedRole, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
      CONNECT: false,
    });
  }

  async updateMuteChannelPerms(guild, role, permissions) {
    await guild.channels.cache.forEach((channel) => {
      new Promise(resolve => setTimeout(resolve, 500));
      channel.updateOverwrite(role, permissions).catch((e) => {
        this.client.Log().error("Muted Role", `${e.name}: ${e.stack}`);
      });
    });
  }

  async findOrCreateMutedRole(guild) {
    const role = guild.roles.cache.find((role) => role.name === "muted");
    role.setPosition(1);

    return (
      guild.roles.cache.find((role) => role.name === "muted") ||
      (await guild.roles.create({
        data: {
          name: "muted",
          color: this.client.color("default"),
          position: 1
        },
        reason: "Mute a user",
      }))
    );
  }
}

module.exports = MutedRoleEvent;