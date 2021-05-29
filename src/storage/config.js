const config = {
  debug : false,
  prefix: "t;",
  bot: {
    token : process.env.DISCORD_TOKEN, // https://discordapp.com/developers/applications/ID/bot
  },
  owners: [
    "817238971255488533"
  ],
  status: [
    {
      type: "COMPETING",
      name: "@{client} help"
    },{
      type: "WATCHING",
      name: "{guilds} servers with {users} users!"
    }
  ],
  database : {
    enable: true,
    replitDB: process.env.REPLIT_DB_URL
  },
  webhook : {
    id: process.env.WEBHOOK_ID,
    token: process.env.WEBHOOK_TOKEN
  },
  erela: {
    nodes: [{
      identifier: "NODE-MAIN",
      host: process.env.LAVALINK_HOST,
      password: process.env.LAVALINK_PASS,
      port: Number(process.env.LAVALINK_PORT),
      secure: true,
    }],
    plugin: {
      enable: false,
      spotify: {
        clientID: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
      }
    }
  }
};

module.exports = config;