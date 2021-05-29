//
function checkArgs(ops = {}) {
  ops.args = ops.args || [];
  ops.usage = ops.usage || [];
  var missing = [], limit = [];
  for (let i = ops.args.length; i < ops.usage.length; i++) {
    missing.push(ops.usage[i]);
  }

  for (let i = ops.usage.length; i < ops.args.length; i++) {
    limit.push(ops.args[i]);
  }
  return { limit: limit, missing: missing };
}

function resolveRequired(options, command, args = []) {
  const { Client, User, Guild, Channel, React } = options;
  const userPermissions = command.userPermissions;
  const clientPermissions = command.clientPermissions;
  const missingPermissions = [];
  const usage = checkArgs({ args: args, usage: command.usage });
  //usage
  if (command.usage && command.usage.length > 0) {
    if (usage.limit.length > 0) console.log(`Usage: not passed!`);
    else if (usage.missing.length > 0) {
      console.log(`Usage: not passed!`);
      if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
      throw { private: true, dm: false, timeout: 5000, cnt: `\`🚫\` That is not a valid usage of this command: ${args} ${usage.missing}` };
    } else console.log(`Usage: passed!`);
  }

  if (Guild && !Channel.permissionsFor(Guild.me).has("SEND_MESSAGES")) {
    throw { private: false, dm: true, timeout: 5000, cnt: "`🚫` It seems like I can't send messages in that channel!"};
  }//Guild Only
  else if (command.guildOnly && !Guild) {
    if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
    throw { private: false, dm: true, timeout: 5000, cnt: "`⚠️` This command cannot be executed on DM channel." };
  }//Owner Only
  else if (command.ownerOnly && !Client.owners.includes(User.id)) {
    if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
    throw { private: true, dm: false, timeout: 5000, cnt: "`♨️` Sorry, this command can only be used by the developer of the bot." };
  }//User Permissions
  else if (Guild && userPermissions.length) {
    for (let i = 0; i < userPermissions.length; i++) {
      const hasPermission = Channel.permissionsFor(Client.user).has(userPermissions[i]);
      if (!hasPermission) {
        missingPermissions.push(userPermissions[i]);
      }
    }
    if (missingPermissions.length) {
      if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
      throw { private: true, dm: false, timeout: 5000, cnt: `\`📛\` Your missing these required permissions: ${missingPermissions.join(", ")}` };
    }
  }//Client Permissions
  else if (Guild && clientPermissions.length) {
    for (let i = 0; i < clientPermissions.length; i++) {
      const hasPermission = Guild.me.permissions.has(clientPermissions[i]);
      if (!hasPermission) {
        missingPermissions.push(clientPermissions[i]);
      }
    }
    if (missingPermissions.length) {
      if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
      throw { private: true, dm: false, timeout: 5000, cnt: `\`📛\` I'm missing these required permissions: ${missingPermissions.join(", ")}` };
    }
  } else {
    //Do nothing
  }

  const { Collection } = require("discord.js");
  const ms = require("pretty-ms");

  if (!Client.ratelimits.has(command.id)) Client.ratelimits.set(command.id, new Collection());
  const now = Date.now();
  const ratelimit = Client.ratelimits.get(command.id);
  const cooldown = command.ratelimit * 1000;

  if (ratelimit.has(User.id)) {
    const expire = ratelimit.get(User.id) + cooldown;
    if (now < expire) {
      const remaining = (expire - now);
      if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🚫");
      throw { private: false, dm: false, timeout: remaining, cnt: `\`🛑\` Please wait **${ms(remaining, { verbose: true })}** before attempting to use the \`${command.id}\` command again.` };
    }
  } else {
    if (React && (Guild && Channel.permissionsFor(Client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !Guild) React.react("🆗");
  }
  ratelimit.set(User.id, now);
  setTimeout(() => ratelimit.delete(User.id), cooldown);
}

const Colors = {
  default: 3553599,
  white: 0xffffff,
  aqua: 0x1abc9c,
  green: 0x2ecc71,
  blue: 0x3498db,
  yellow: 0xffff00,
  purple: 0x9b59b6,
  gold: 0xf1c40f,
  orange: 0xe67e22,
  red: 0xe74c3c,
  grey: 0x95a5a6,
  navy: 0x34495e
};

function resolveColor(color) {
  color = color.toLowerCase();
  if (typeof color === "string") {
    if (color === "random") {
      var lum = -0.10;
      var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, "");
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var random = "#", c, i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        random += ("00" + c).substr(c.length);
      }
      return color = random;
    }
    //else if (color === "default") color = 0;
    else color = Colors[color] || parseInt(color.replace("#", ""), 16);
  } else if (Array.isArray(color)) {
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  }

  if (color < 0 || color > 0xffffff) throw new Error("COLOR_RANGE");
  else if (color && isNaN(color)) throw new Error("COLOR_CONVERT");
  var red = (color >> 16) & 255;
  var green = (color >> 8) & 255;
  var blue = color & 255;

  const rgb = (red << 16) | (green << 8) | (blue << 0);
  return "#" + (0x1000000 + rgb).toString(16).slice(1);
}

async function pagination(message, pages, emojis = ["⏪", "◀️", "⏹️", "▶️", "⏩"], timeout = 120000, bot = false, userID = [message.author.id]) {

  if(!message && !message.channel) throw new Error("The Message class object you have passed in is not a valid message.");
  if(!pages || pages.length === 0) throw new Error("An array of pages were not passed in! Please make sure you have passed in at least one.");
  if(emojis.length !== 5) throw new Error("There needs to be five emojis!");
  let page = 0;

  const avatar = message.author.displayAvatarURL({ dynamic: true });
  const curPage = await message.channel.send(pages[page].setFooter(`${message.author.username} | Page ${page + 1} / ${pages.length}`, avatar).setTimestamp());
  for (const emoji of emojis) await curPage.react(emoji);

  const collector = curPage.createReactionCollector((reaction, user) => emojis.includes(reaction.emoji.name || reaction.emoji.id) && bot === true ? user.bot : !user.bot && userID.includes(user.id), { time: timeout });
  const [ first, previous, stop, next, last ] = emojis;
  collector.on("collect", (reaction, user) => {
    reaction.users.remove(user);
    switch(reaction.emoji.name) {
    case first:
      page = 0;
      break;
    case previous:
      page = page > 0 ? --page : pages.length - 1;
      break;
    case stop:
      collector.stop();
      if(!curPage.deleted) {
        curPage.reactions.removeAll();
      }
      break;
    case next:
      page = page + 1 < pages.length ? ++page : 0;
      break;
    case last:
      page = pages.length - 1;
      break;
    default:
      break;
    }
    new Promise(resolve => setTimeout(resolve, 500));
    curPage.edit(pages[page].setFooter(`${message.author.username} | Page ${page + 1} / ${pages.length}`, avatar).setTimestamp());
  });

  collector.on("end", () => {
    if(!curPage.deleted) {
      curPage.reactions.removeAll();
    }
  });
  return curPage;
}

async function removeReactionSlowdown() {
  const fs = require("fs").promises;
  const filePath =  process.cwd() + "/node_modules/discord.js/src/rest/RequestHandler.js";
  const file = await fs.readFile(filePath, { encoding: "utf8" }, () => {});
  const found = file.match(/getAPIOffset\(serverDate\) \+ 250/gim);
  if (!(found)) return;

  console.log("Removing additional 250ms timeout for reactions.\nWill need to restart process for changes to take effect.");
  const newFile = file.replace(/getAPIOffset\(serverDate\) \+ 250/gim, "getAPIOffset(serverDate)");
  await fs.writeFile(filePath, newFile, { encoding: "utf8" }, () => {});
  return process.exit();
}

module.exports = {
  removeReactionSlowdown: removeReactionSlowdown,
  paginate : pagination,
  requirements: resolveRequired,
  color: resolveColor
};