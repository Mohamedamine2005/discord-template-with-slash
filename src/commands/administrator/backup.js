const Command = require("../../struct/command.js");
const backup = require("discord-backup");
backup.setStorageFolder(process.cwd() + "/backups/");

class BackupCommand extends Command {
  constructor() {
    super({
      id: "backup",
      description: "Backup your server settings.",
      ratelimit: 5,
      category: "administrator",
      clientPermissions: ["ADMINISTRATOR"],
      userPermissions: ["ADMINISTRATOR"]
    });
  }

  async do(message, [key, ...value]) {
    try {
      const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct"];
      if (!value || value.length === 0) { value = undefined; }
      const Method = key ? key.toLowerCase() : "";
      switch (Method) {
        case "add":
        case "create":
          // eslint-disable-next-line no-case-declarations
          const create = await backup.create(message.guild, {
            maxMessagesPerChannel: 25,
            saveImages: "base64",
            jsonSave: true,
            jsonBeautify: true
          });
          if (!create) return message.channel.send("`❌` There was an error, please check that the bot has an administrator!");
          message.channel.send(`Backup created! Here is your ID: ${create.id}!\nUse \`\`${this.client.user.username} backup load ${create.id}\`\` to load the backup on another server!`);
          break;
        case "load":
          backup.fetch(value.join(" ")).then(async () => {
            const res = await this.client.nekoyasui.prompt.reply(message.channel, `All the server channels, roles, and settings will be cleared. Do you want to continue?`, { userID: message.author.id });
            if (!(yes.some((str) => res.toLowerCase().includes(str)))) return;
            backup.load(value.join(" "), message.guild, {
              clearGuildBeforeRestore: true
            }).then(() => {
              return message.author.send("The backup was successfully loaded!");
            }).catch((e) => {
              if (e === "No backup found") return message.channel.send(`\`❌\` ID: \`\`${value.join(" ")}\`\` has no backup available.`);
              else return message.author.send(`\`❌\` An error occurred: ${(typeof e === "string") ? e : JSON.stringify(e)}`);
            });
          });
          break;
        case "info":
        case "information":
          backup.fetch(value.join(" ")).then((info) => {
            const date = new Date(info.data.createdTimestamp);
            const yyyy = date.getFullYear().toString(), mm = (date.getMonth() + 1).toString(), dd = date.getDate().toString();
            const formatedDate = `${yyyy}/${(mm[1] ? mm : "0" + mm[0])}/${(dd[1] ? dd : "0" + dd[0])}`;

            const embed = this.client.BaseEmbed(message);
            embed.setAuthor("Backup Informations");
            embed.addField([
              "**❯ ID:** " + info.id,
              "**❯ Server ID:** " + info.data.guildID,
              "**❯ Size:** " + `${info.size} kb`,
              "**❯ Created at:** " + formatedDate
            ].join("\n"));

            return message.channel.send("", { embed : embed });
          }).catch(() => {
            // if the backup wasn't found
            return message.channel.send(`\`❌\` ID: \`\`${value.join(" ")}\`\` has no backup available.`);
          });
      }
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = BackupCommand;