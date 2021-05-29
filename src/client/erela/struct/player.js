const { Structure } = require("erela.js");

module.exports = Structure.extend("Player", Player => {
  class player extends Player {
    constructor(...args) {
      super(...args);
      this.musicTrivia = false;
      this.speed = 1;
      this.timeout = null;
      this.twentyFourSeven = false;
    }
    setPlaylist(){
      console.log("kek");
      return this.client.database.all();
    }

    setFilter(body = {}) {
      this.node.send({
        op: "filters",
        guildId: this.guild.id || this.guild,
        ...body,
      });
      return this;
    }

    resetFilter() {
      this.node.send({
        op: "filters",
        guildId: this.guild.id || this.guild,
        ...{},
      });
      return this;
    }

    setSpeed(value) {
      this.speed = value;
      this.node.send({
        op: "filters",
        guildId: this.guild.id || this.guild,
        timescale: { speed: value },
      });
      return this;
    }
  }
  return player;
});