const Method = require("./method");

const Callback = async (response, data) =>{
  if (!data || !response) return;
  if (!response.token) throw new Error('Token missing');
  data.token = response.token;
  let guild = response.guild;
  let member = response.member;
  let channel = response.channel;
  let extras = { member, channel, guild, user: response.user || null };
  let interaction = new Method(response.client, data, extras);
  return interaction;
};

class Interaction {
  /**
   * Class for replaying to an interaction or other purposes
   * @param {Object} interaction - Raw interaction object from the api
   * @param {*} options - Extra data
   */
  constructor(interaction, options){

    let { channel, guild = null, client, member = null, user = null, sync } = options;
    this.type = interaction.type;
    this.token = interaction.token;
    this.member = member;
    this.id = interaction.id;
    this.client = client;
    this.guild = guild;
    this.data = interaction.data;
    this.channel = channel;
    this.user = user;
    this.sync = sync;

  }
  /**
   * Sends an Interaction response
   * @param {String} res - The message string or embed object
   * @param {Options} options - Options that should be passed to the api
   * @returns {Object}  Method object
   * @example
   * interaction.reply("Bello")
   */
  async reply(res, options = {}){
    let {
      embed,
      embeds = [],
      flags = null,
      type = 4,
      tts = false,
      components = []
    } = options;
    this.ephemeral = ( flags == 64 ? true : false );
    let data;
    if (!res && !options.embed && !options.embeds) throw new Error('Cannot send an empty message.');
    if (embed) embeds.push(embed);
    data = {
      content: res || "",
      embeds: embeds,
      flags: flags,
      tts: tts,
      components: components
    };

    let b = await this.client.api.interactions(this.id, this.token).callback
      .post({ data:{
        type: type,
        data:data
      }});
    if (this.sync && !this.ephemeral) b = await this.client.api.webhooks(this.client.user.id, this.token).messages('@original').get();
    return await Callback(this, b);

  }

}
module.exports = Interaction;