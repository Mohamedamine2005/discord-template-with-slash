const Event = require("../../struct/event.js");

class MessageEvent extends Event {
  constructor() {
    super({
      id: "message",
      once: false,
    });
  }

  async do(message) {
    if (message.author.bot || message.author.id === message.client.user.id || message.bot) return;
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixREGEX = new RegExp(`^(${this.client.prefix ? `${escapeRegex(this.client.prefix)}|` : ""}<@!?${this.client.user.id}>|${escapeRegex(this.client.user.username.toLowerCase())}|<@!?${message.author.id}> cmd|${escapeRegex(message.author.username.toLowerCase())} cmd)`, "i", "(\s+)?"); // eslint-disable-line no-useless-escape
    var prefixUSED = message.content.toLowerCase().match(prefixREGEX);
    prefixUSED = prefixUSED && prefixUSED.length && prefixUSED[0]; // eslint-disable-line no-unused-vars

    let args, commandName; //Arguments|CommandName
    if (!prefixUSED) {
      if (!prefixUSED && !(message.mentions.users.first() && message.mentions.users.first().id === message.client.user.id)) return;
      args = message.content.trim().split(/ +/g);
      commandName = args.shift().toLowerCase();
    } else {
      args = message.content.slice(prefixUSED.length).trim().split(/ +/g);
      commandName = args.shift().toLowerCase();
    }

    let command = this.client.commands.get(commandName) || this.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    let options = { Client: message.client, User: message.author, Guild: message.guild, Channel: message.channel, React: message };
    if (command) {
      try {
        this.client.requirements(options, command, args);
        await command.do(message, args);
      } catch (error) {
        if (error.dm) {
          message.author.send(`${error.cnt}`).then((msg) => {
            setTimeout(() => msg.delete(), error.timeout);
          }).catch(() => null);
        } else {
          message.channel.send(error.cnt).then((msg) => {
            setTimeout(() => msg.delete(), error.timeout);
          });
        }
      }
    } else {
      /**const didYouMean = require("didyoumean2").default;
      const commands = this.client.commands.map((c) => c.id);
      const commandFound = didYouMean(commandName.toLowerCase(), commands);
      if (!(shuffle([true, false])[Math.floor(Math.random() * [true, false].length)]) && commandFound) {
        const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct", "opo"];
        const youmean = await this.client.nekoyasui.prompt.reply(message.channel, `Did you mean? \`${commandFound}\` command`, { userID : message.author.id });
        if (youmean && yes.some((str) => youmean.toLowerCase().includes(str))) {
          try {
            this.client.requirements(options, this.client.commands.get(commandFound), args);
            this.client.commands.get(commandFound).do(message, message.content.slice(commandFound.length).trim().split(/ +/g).slice(1));
          } catch (error) {
            const msg = error.dm ? await message.author.send(error.cnt) : await message.channel.send(error.cnt);
            setTimeout(() => msg.delete(), error.timeout);
          } return;
        } else return message.channel.send("Ok, make sure the command your getting are exist.");
      } else {
        // Do nothing
      }*/
      if (!(message.content.startsWith(`<@!${this.client.user.id}> `) || message.content === `<@!${this.client.user.id}>` || (message.mentions.users.first() && message.mentions.users.first().id === message.client.user.id && !(message.content.includes(`<@!${this.client.user.id}>`))))) return;
      if (message.content === `<@!${this.client.user.id}>`) {
        return message.channel.send(`My default prefix is **${this.client.prefix}**`);
      }
      const master = await this.client.nekoyasui.search.user(message, "817238971255488533");
      if (!(master)) console.log("Oh! noooooo.. where r u master!");
      let bot = {}, owner = {}, res;
      bot.username = this.client.user.username;
      bot.birthdate = "11/2/2002";
      bot.prefix = this.client.prefix;
      bot.gender = "male";
      bot.description = "Multipurpose Discord Bot that will brighten up your server! with fantastic features!\nSuch as Moderation, Utility, Economy, Music, Chat, and  much more!";
      owner.id = master.id;
      owner.invite = "n6EnQcQNxg";
      owner.username = master.username;
      owner.discriminator = master.discriminator;
      //const storedSettings = await this.client.database.get(`settings.${message.guild.id}`);
      res = await this.client.nekoyasui.chat(String(message.content), message.author.id, bot, owner);
      if (!(res.status)) return console.log(res.cnt);
      /**if (storedSettings.owo) {
        const { owo } = await this.client.neko.sfw.OwOify({ text: res.cnt });
        res.cnt = owo;
			}**/
      return message.channel.send(res.cnt);
    }
  }
}

module.exports = MessageEvent;