const Event = require("../../struct/event.js");
String.prototype.replaceAFKAll = function (Old, New, Ignore) {
  // eslint-disable-next-line no-useless-escape
  return this.replace(new RegExp(Old.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (Ignore ? "gi" : "g")), (typeof (New) == "string") ? New.replace(/\$/g, "$$$$") : New);
};
Object.defineProperty(Array.prototype, "randomAFK", {
  value: function () {
    //return this.splice(Math.floor(Math.random() * this.length), 1);
    return this[Math.floor(Math.random() * this.length)];
  }
});

class AFKEvent extends Event {
  constructor() {
    super({
      id: "message",
      once: false,
    });
  }

  async do(message) {
    if (!message.guild || !message.author || !message.content || message.author.bot || message.author.id === this.client.user.id) return;
    //if (!(await this.client.database.get(`afk.${message.guild.id}.${message.author.id}`))) return;
    const mentioned = message.mentions.members.first();
    const memberAFK = await this.client.database.get(`afk.${message.guild.id}.${message.author.id}`);
    const cache = message.guild.members.cache;

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = [
      "((i|ill|I'll|i'll|im)( *)(gonna|gtg)( *)(sleep|slept|afk))",
      "((i|ill|I'll|i'll)( *)(goin|going)( *)to( *)(sleep|slept|afk))",
      "(gotta( *)go)",
      `(${escapeRegex(this.client.prefix)}afk)`,
      "(( *)cya( *)(gonna|goin))",
      "((i|ill|I'll|i'll)( *)be( *)right( *)back)"];
    const setAFK = new RegExp(regex.join("|"), "i");

    if (setAFK.test(message.content)) {
      const contents = message.content.replace(setAFK, "");
      const reason = contents.length > 5 ? contents : "none";
      const valueAFK = {
        "id": message.author.id,
        "username": message.author.username,
        "reason": reason,
        "time": Date.now()
      };
      await this.client.database.set(`afk.${message.guild.id}.${message.author.id}`, valueAFK);
      if (message.author.id !== message.guild.ownerID) {
        if (!(message.channel.permissionsFor(message.guild.me).has(["MANAGE_NICKNAMES"]))) return;
        message.member.setNickname(`[AFK] ${message.member.nickname ? message.member.nickname.replaceAFKAll("[AFK] ", "") : message.author.username.replaceAFKAll("[AFK] ", "")}`);
      } message.channel.send(`${message.author.username} are now goin to AFK.`);
      return console.log("AFK Module", `${message.member.nickname ? message.member.nickname : message.author.username} are now AFK`);
    }

    if ((memberAFK)) {
      const member = await cache.get(memberAFK.id);
      if (!(member)) return;
      await this.client.database.delete(`afk.${message.guild.id}.${member.user.id}`);
      if (message.author.id !== message.guild.ownerID) {
        if (!(message.channel.permissionsFor(message.guild.me).has(["MANAGE_NICKNAMES"]))) return;
        member.setNickname(member.nickname ? member.nickname.replaceAFKAll("[AFK] ", "") : member.user.username.replaceAFKAll("[AFK] ", ""));
      }
      message.channel.send(`${member.user.username} is now back!`);
      return console.log("AFK Module", `${member.user.username} is now Back`);
    }

    if (mentioned) {
      if (!(await this.client.database.get(`afk.${message.guild.id}.${mentioned.id}`))) return;
      let {
        id, reason, time
      } = await this.client.database.get(`afk.${message.guild.id}.${mentioned.id}`);
      if (reason === "none") reason = ["Hey bruh, im not available right now.", "Ping me later, cuz im tired.", "Hmm, ping me later bruhh...", "Don't mention me bruh.. maybe next time :poop:"].randomAFK();
      const content = (`I'm currently AFK (${require("moment")(time).fromNow()})\n**Reason: **${reason}`);
      const member = await cache.get(id);

      if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_WEBHOOKS"])) return message.channel.send(`${member} is currently AFK (${require("moment")(time).fromNow()})\n**Reason: **${reason}`);
      try {
        const webhook = await message.channel.createWebhook(member.user.username, { avatar: member.user.displayAvatarURL({ size: 4096, dynamic: true }) });
        console.log("'webhook' created (afk)");
        await webhook.send(content);
        setTimeout(async () => {
          await webhook.delete();
          console.log("'webhook' deleted (afk)");
        }, 9e3);
      } catch (e) {
        if (e.stack.includes("Maximum number of ")) {
          console.log("'webhook' cannot create more than 10 webhooks. (afk)");
          return message.channel.send(`${member} is currently AFK (${require("moment")(time).fromNow()})\n**Reason: **${reason}`);
        }
      }
    }
  }
}

module.exports = AFKEvent;