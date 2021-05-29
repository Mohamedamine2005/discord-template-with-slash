//Credits: Nekoyasui#6804

const { Client, Collection, Intents, WebhookClient } = require("discord.js");
const { loadEvents, loadCommands, loadSlash, loadMonitor } = require("../struct/registries");
const { Database } = require("quick.replit");
const { JsonDatabase } = require("wio.db");
const { ReactionRole } = require("reaction-role");
const NekoLife = require("nekos.life");
const Nekoyasui = require("nekoyasui");

class client extends Client {
  /**
   * @param {ClientSettings} [storage] for this client, including the ClientOptions [options] for the client
   */
  constructor(storage = {}) {
    // pass in any client configuration you want for the bot.
    // more client options can be found at
    // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
    super(
      /* Discord.js Client Options */
      {
        ws: {
          intents: Intents.ALL,
          properties: {
            $browser: "iOS"
          }
        },

        /**The type of Structure allowed to be a partial:
         * USER
         * CHANNEL (only affects DMChannels)
         * GUILD_MEMBER
         * MESSAGE
         * REACTION
         */
        partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],

        // Cache all guild members and users upon startup, as well as upon joining a guild
        fetchAllMembers: true,

        // Disable Mentions except Users
        allowedMentions: { parse: ["users"] },
        restTimeOffset: 0,
        restWsBridgetimeout: 100,
        // Sweep messages every 12 hours
        messageCacheLifetime: 43200,
        messageSweepInterval: 43200
      }
    );

    //Clear Console
    //console.clear();

    // Initialize bot, log on terminal when instantiated.
    console.log(`Initializing the client. Please wait...`);

    //bypass reaction ratelimiting..
    storage.utils.removeReactionSlowdown();

    this.description = require(`${process.cwd()}/package.json`).description;

    this.nekoyasui = Nekoyasui;

    this.neko = new NekoLife();

    this.database = storage.config.database.enable ? storage.config.database.replitDB ? new Database(storage.config.database.replitDB) : new JsonDatabase("database") : new JsonDatabase("database");

    this.token = storage.config.bot.token;

    this.status = storage.config.status;

    if (typeof storage.config.prefix !== "string") storage.config.prefix = "m!";

    this.prefix = storage.config.prefix;

    this.owners = storage.config.owners;

    this.debug = storage.config.debug;

    this.requirements = storage.utils.requirements;

    this.paginate = storage.utils.paginate;

    this.color = storage.utils.color;

    this.events = new Collection();

    this.commands = new Collection();

    this.slashEvents = new Collection();

    this.slashCommands = new Collection();

    this.ratelimits = new Collection();

    this.snipes = new Collection();

    this.esnipes = new Collection();

    this.logChn = new WebhookClient(storage.config.webhook.id, storage.config.webhook.token);

    this.reactionrole = new ReactionRole(this.token);


    this.reactionrole.onGet(async () => {
      const saved = (await this.database.get("reaction_roles")) || {};
      return saved;
    }).onSet(async (data) => {
      await this.database.set("reaction_roles", data);
    }).onDelete(async (message_id) => {
      await this.database.delete(`reaction_roles.${message_id}`);
    });

    this.messages = { received: 0, sent: 0 };
    super.on("message", async (message) => {
      if (message.author.id === message.client.user.id) {
        return this.messages.sent++;
      } else {
        return this.messages.received++;
      }
    });

    this.settings = {};
    super.on("message", async (message) => {
      if (!message.guild) return;
      var storedSettings = await this.database.get(`settings.${message.guild.id}`);
      if (!storedSettings) {
        const defaultSettings = { prefix : storage.config.prefix };
        await this.database.set(`settings.${message.guild.id}`, defaultSettings);

        storedSettings = await this.database.get(`settings.${message.guild.id}`);
      }
      if (!storedSettings.channel) {
        const defaultSettings = { ...storedSettings, channel : {
          chat : {
            enabled : false,
            id: null
          },
          logging : {
            enabled : false,
            id: null
          },
        }};
        await this.database.set(`settings.${message.guild.id}`, defaultSettings);

        storedSettings = await this.database.get(`settings.${message.guild.id}`);
      }
      this.settings = storedSettings;
      this.prefix = this.settings.prefix || storage.config.prefix;
      return;
    });

    // signing bot account, then load events/commands/monitor
    super.login().then(() => {
      this.Log().success("Discord Token", "Your token is correct!");
      loadEvents(this); loadCommands(this); loadSlash(this); loadMonitor(this);
      new Promise(resolve => setTimeout(resolve, 4000));
      require("./erela")(this, storage.config.erela); require("../scripts/docs")(this);
    }).catch((e) => this.Log().error("Discord Token", e.stack));
  }

  BaseEmbed(message) {
    if (!message) throw new ReferenceError("'message' must be passed down as param! (BaseEmbed)");
    const avatar = message.author.displayAvatarURL({ dynamic: true });
    const { MessageEmbed } = require("discord.js");
    return new MessageEmbed().setFooter(message.author.username, avatar).setColor(this.color("default")).setTimestamp();
  }

  Log() {
    const debug = this.debug;
    const chalk = require("chalk");
    const moment = require("moment");
    return {
      success(type, success) {
        return console.log(chalk.green(`[${moment().format("h:mm A")}] | [SUCCESS][${type}]: ${success}`));
      },
      warn(type, warning) {
        return console.warn(chalk.yellow(`[${moment().format("h:mm A")}] | [WARNING][${type}]: ${warning}`));
      },
      error(type, error) {
        return console.error(chalk.red(`[${moment().format("h:mm A")}] | [ERROR][${type}]: ${error}`));
      },
      debug(type, bug) {
        if (!debug) return;
        return console.log(chalk.black(`[${moment().format("h:mm A")}] | [DEBUG][${type}]: ${bug}`));
      },
      info(type, message) {
        return console.log(`[${moment().format("h:mm A")}] | [INFO][${type}]: ${message}`);
      }
    };
  }

  initialize() {
    const glitch = (process.env.PROJECT_DOMAIN !== undefined && process.env.PROJECT_INVITE_TOKEN !== undefined && process.env.API_SERVER_EXTERNAL !== undefined && process.env.PROJECT_REMIX_CHAIN !== undefined) || false;
    const replit = (process.env.REPLIT_DB_URL !== undefined) || false;

    if (glitch) this.Log().warn("GLITCH ENVIRONMENT DETECTED", "Starting the web server.");
    else if (replit) this.Log().warn("REPLIT ENVIRONMENT DETECTED", "Starting the Web server.");
    else return;
  }
}

module.exports = client;