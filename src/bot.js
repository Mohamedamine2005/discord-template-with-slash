// load env file (contains important keys)
require("dotenv").config();

const storage = require("./storage/index.js");

const Client = require("./client");
const client = new Client(storage);
client.initialize(); //Checking environment then start the web server.