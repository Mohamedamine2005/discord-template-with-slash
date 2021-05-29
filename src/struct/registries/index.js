function loadEvents(client) {
  const { sync } = require("glob");
  const { resolve } = require("path");
  const Event = require("../event.js");
  const didYouMean = require("didyoumean2").default;
  const listeners = ["channelCreate", "channelDelete", "channelPinsUpdate", "channelUpdate", "clientUserGuildSettingsUpdate", "clientUserSettingsUpdate", "directMessage", "emojiCreate", "emojiDelete", "emojiUpdate", "guildBanAdd", "guildBanRemove", "guildCreate", "guildDelete", "guildMemberAdd", "guildMemberAvailable", "guildMemberRemove", "guildMembersChunk", "guildMemberSpeaking", "guildMemberUpdate", "guildUnavailable", "guildUpdate", "messageDelete", "messageDeleteBulk", "messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll", "message", "messageUpdate", "presenceUpdate", "ready", "reconnecting", "resume", "roleCreate", "roleDelete", "roleUpdate", "typingStart", "typingStop", "userNoteUpdate", "userUpdate", "voiceStateUpdate", "debug", "error", "warn"];

  const eventFiles = sync(resolve("./src/events/**/*.js"));
  for (const filepath of eventFiles) {
    delete require.cache[require.resolve(filepath)];
    const File = require(filepath);
    if (!(File.prototype instanceof Event)) return;
    const event = new File();
    if (!(event.enable)) return;
    if (!(event.id)) return console.error(`${filepath} > Missing 'event.id'`);
    if (!(listeners.some((listener) => listener === event.id))) {
      const listener = didYouMean(event.id.toLowerCase(), listeners);
      if (listener) return console.error(`${filepath} > 'event.id' invalid event listener, did you mean? '${listener}'`);
    }
    event.client = client;
    event.filepath = filepath;
    client.events.set(event.id, event);
    const emitter = event.emitter ? typeof event.emitter === "string" ? client[event.emitter] : emitter : client;
    emitter[event.type ? "once" : "on"](event.id, async (...args) => await event.do(...args));
  }
}

function loadCommands(client) {
  const { sync } = require("glob");
  const { resolve } = require("path");
  const Command = require("../command.js");

  const commandFiles = sync(resolve("./src/commands/**/*.js"));
  for (const filepath of commandFiles) {
    delete require.cache[require.resolve(filepath)];
    const File = require(filepath);
    if (!(File.prototype instanceof Command)) return;
    const command = new File();
    command.client = client;
    command.filepath = filepath;
    client.commands.set(command.id, command);
  }
}

function loadSlash(client){
  const EventEmitter = require("events");
  const slash = new EventEmitter;
  client.on("ready", async () => {

    const { sync } = require("glob");
    const { resolve } = require("path");
    const SlashCommand = require("../slash-commands.js");

    const slashCommandFiles = sync(resolve("./src/slash/commands/**/*.js"));
    for (const filepath of slashCommandFiles) {
      delete require.cache[require.resolve(filepath)];
      const File = require(filepath);
      if (!(File.prototype instanceof SlashCommand)) return;
      const command = new File();
      command.client = client;
      command.filepath = filepath;
      client.slashCommands.set(command.id, command);
    }

    client.slashCommands.each(async (command) => {
      if (!(command.id)) return client.Log().error("Discord Slash - Command", `${command.filepath} > Missing 'slash.id'`);
      if (!command.guilds) {
        client.api.applications(client.user.id).commands.post({
          data: {
            name: command.id,
            description: command.description,
            options: command.options
          }
        }).then((m) => {
          slash.emit("SLASH_CREATE", command, { isGlobal: true, isGuild: false, guild: {} });
          client.Log().success("Discord Slash - Global Command", command.id + " was registered");
          client.Log().debug("Discord Slash - Global Command", m);
        }).catch((e) => { client.Log().error("Discord Slash - Guild Command", e); });
      } else {
        command.guilds.forEach(async (guild) => {
          client.api.applications(client.user.id).guilds(guild).commands.post({
            data:{
              name: command.id,
              description: command.description,
              options: command.options
            }
          }).then((m) => {
            slash.emit("SLASH_CREATE", command, { isGlobal: false, isGuild: true, guild: client.guilds.resolve(guild) || null });
            client.Log().success("Discord Slash - Guild Command", command.id + " was registered for: " + guild);
            client.Log().debug("Discord Slash - Guild Command", m);
          }).catch((e) => { client.Log().error("Discord Slash - Guild Command", e); });
        });
      }
    });

    client.Log().success("Discord Slash - Completed", client.slashCommands.size + " commands were registered on discord API");
  });

  client.on("ready", async () => {
    const { sync } = require("glob");
    const { resolve } = require("path");
    const SlashEvent = require("../event.js");
    const didYouMean = require("didyoumean2").default;
    const listeners = ["SLASH_INTERACTION", "SLASH_CREATE"];

    const eventFiles = sync(resolve("./src/slash/events/**/*.js"));
    for (const filepath of eventFiles) {
      delete require.cache[require.resolve(filepath)];
      const File = require(filepath);
      if (!(File.prototype instanceof SlashEvent)) return;
      const event = new File();
      if (!(event.enable)) return;
      if (!(event.id)) return console.error(`${filepath} > Missing 'event.id'`);
      if (!(listeners.some((listener) => listener === event.id))) {
        const listener = didYouMean(event.id.toLowerCase(), listeners);
        if (listener) return console.error(`${filepath} > 'event.id' invalid slash event listener, did you mean? '${listener}'`);
      }
      event.client = client;
      event.filepath = filepath;
      client.slashEvents.set(event.id, event);
      const emitter = event.emitter ? typeof event.emitter === "string" ? slash[event.emitter] : emitter : slash;
      emitter[event.type ? "once" : "on"](event.id, async (...args) => await event.do(...args));
    }
  });

  client.ws.on("INTERACTION_CREATE", (interaction) => {
    const Interaction = require("./slash/interaction");
    if (interaction.type == 2) {
      (async (interaction, client) => {
        const guild = client.guilds.resolve(interaction.guild_id) || null;
        const member = (interaction.member ? guild ? guild.members.add(interaction.member) : null : null) || null;
        const user = client.users.add((interaction.user || interaction.member.user)) || null;
        const channel = client.channels.resolve(interaction.channel_id);

        const Options = { guild, channel, member, client, user, sync: true };

        interaction = new Interaction(interaction, Options);
        const { options } = interaction.data;
        try {
          client.requirements({ Client: client, User: user, Guild: guild, Channel: channel }, client.slashCommands.get(interaction.data.name));
          slash.emit("SLASH_INTERACTION", interaction, { member, guild, options, channel });
          client.slashCommands.get(interaction.data.name).do(interaction, { member, guild, options, channel });
        } catch (error) {
          if (error.dm) {
            user.send(`${error.cnt}`).then((msg) => {
              setTimeout(() => msg.delete(), error.timeout);
            });
          } else {
            if (error.private) {
              interaction.reply(`${error.cnt}`, { flags: 64 });
            } else {
              interaction.reply(`${error.cnt}`).then((msg) => {
                setTimeout(() => msg.delete(), error.timeout);
              });
            }
          }
        }
      })(interaction, client);
    } else return;
  });
}

function loadMonitor(client){
  const ms = require("ms");
  const PrettyError = require("pretty-error");
  const pe = new PrettyError();

  client.on("error", (error) => {
    client.Log().error("Discord Error", error);
  });

  client.on("guildUnavailable", (guild) => {
    client.Log().error("Discord Error", `${guild.name} is unreachable, likely due to outage`);
  });

  client.on("invalidated", () => {
    client.Log().error("Discord Error", `Client session has become invalidated.`);
    client.destroy();
  });

  client.on("rateLimit", (ratelimit) => {
    client.Log().error("Discord Error", `Client is being rate limited.
    Timeout: ${ms(ratelimit.timeout)} ms
    Limit: ${ratelimit.limit}
    Method: ${ratelimit.method}
    Path: ${ratelimit.path}
    Route: ${ratelimit.route}`);
  });

  client.on("warn", (info) => {
    client.Log().warn("Discord Warning", info);
  });

  client.on("debug", (bug) => {
    client.Log().debug("Discord Debug", bug);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  const doingAction = false;

  function shutdown(signal) {
    client.Log().success("Discord Bot", "Waiting for safe shutdown due to " + signal + "!");
    waitForShutdown(signal);
  }

  async function waitForShutdown(signal) {
    if (doingAction) {
      setImmediate(waitForShutdown, signal);
    } else {
      client.Log().warn("Discord Bot", "Bot shutting down now due to " + signal + "!");
      try {
        client.logChn.send("Bot shutting down now due to " + signal + "!")
          .then(() => {
            new Promise((resolve) => setTimeout(resolve, 1000));
            client.Log().warn("Discord Bot", "Safe! shutting down...");
            client.destroy();
            process.exit();
          });
      } catch(e) { console.log(e); }
    }
  }

  process.on("uncaughtException", (e) => {
    e.stack = e.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.Log().error("Uncaught Exception", pe.render(e));
    process.exit(1);
  });

  process.on("uncaughtExceptionMonitor", (e) => {
    e.stack = e.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.Log().error("Uncaught Exception Monitor", pe.render(e));
    process.exit(1);
  });

  process.on("beforeExit", (code) => { // eslint-disable-line no-unused-vars
    console.log("=== before Exit ===".toUpperCase());
  });

  process.on("exit", (code) => { // eslint-disable-line no-unused-vars
    console.log("=== exit ===".toUpperCase());
  });

  process.on("multipleResolves", (type, promise, reason) => { // eslint-disable-line no-unused-vars
    console.log("=== multiple Resolves ===".toUpperCase());
  });
}

module.exports = {
  loadEvents,
  loadCommands,
  loadSlash,
  loadMonitor
};