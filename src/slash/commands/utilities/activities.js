const SlashCommand = require("../../../struct/slash-commands.js");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

class TestCommand extends SlashCommand {
  constructor() {
    super({
      id: "activities",
      description: "Voice channel activities",
      guilds: ["789800070895763476"],
      ratelimit: 5,
      options: [{
        name: "channel",
        description: "Select the voice channel you want.",
        required: true,
        type: 7,
      }, {
        name: "type",
        description: "Type of activity.",
        required: true,
        type: 3,
        choices: [{
          name: "YouTube Together",
          value: "yt"
        }, {
          name: "Betrayal.io",
          value: "bio"
        }, {
          name: "Poker Night",
          value: "pn"
        }, {
          name: "Fishington.io",
          value: "fio"
        }, {
          name: "Chess in the Park",
          value: "citp"
        }]
      }]
    });
  }

  async do (interaction, { member, options }) {
    try {
      const avatar = member.user.displayAvatarURL({ dynamic: true });
      const embed = new MessageEmbed().setFooter(member.user.username, avatar).setColor(this.client.color("default")).setTimestamp();
      let channel = this.client.channels.cache.get(options.find((x) => x.name === "channel").value);
      if(channel.type !== "voice") return interaction.reply("`🛑` Channel must be a voice channel.", { flags: 64 });
      if(options.find(m => m.name === "type").value === "yt") {
        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
          method: "POST",
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: "755600276941176913",
            target_type: 2,
            temporary: false,
            validate: null
          }),
          headers: {
            "Authorization": `Bot ${this.client.token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json()).then(invite => {
          embed.setTitle("Activity added!");
          embed.setDescription(`Added **YouTube Together** to [${channel.name}](https://discord.com/invite/${invite.code})\n> Click on the hyperlink to join.`);
          interaction.reply("", { embed: embed });
        });
      }
      if(options.find(m => m.name === "type").value === "pn") {
        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
          method: "POST",
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: "755827207812677713",
            target_type: 2,
            temporary: false,
            validate: null
          }),
          headers: {
            "Authorization": `Bot ${this.client.token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json()).then(invite => {
          embed.setTitle("Activity added!");
          embed.setDescription(`Added **Poker Night** to [${channel.name}](https://discord.com/invite/${invite.code})\n> Click on the hyperlink to join.`);
          interaction.reply("", { embed: embed });
        });
      }
      if(options.find(m => m.name === "type").value === "bio") {
        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
          method: "POST",
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: "773336526917861400",
            target_type: 2,
            temporary: false,
            validate: null
          }),
          headers: {
            "Authorization": `Bot ${this.client.token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json()).then(invite => {
          embed.setTitle("Activity added!");
          embed.setDescription(`Added **Betrayal.io** to [${channel.name}](https://discord.com/invite/${invite.code})\n> Click on the hyperlink to join.`);
          interaction.reply("", { embed: embed });
        });
      }
      if(options.find(m => m.name === "type").value === "fio") {
        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
          method: "POST",
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: "814288819477020702",
            target_type: 2,
            temporary: false,
            validate: null
          }),
          headers: {
            "Authorization": `Bot ${this.client.token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json()).then(invite => {
          embed.setTitle("Activity added!");
          embed.setDescription(`Added **Fishington.io** to [${channel.name}](https://discord.com/invite/${invite.code})\n> Click on the hyperlink to join.`);
          interaction.reply("", { embed: embed });
        });
      }
      if(options.find(m => m.name === "type").value === "citp") {
        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
          method: "POST",
          body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: "832012586023256104",
            target_type: 2,
            temporary: false,
            validate: null
          }),
          headers: {
            "Authorization": `Bot ${this.client.token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.json()).then(invite => {
          embed.setTitle("Activity added!");
          embed.setDescription(`Added **Chess in the Park** to [${channel.name}](https://discord.com/invite/${invite.code})\n> Click on the hyperlink to join.`);
          interaction.reply("", { embed: embed });
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = TestCommand;