const Command = require("../../struct/command.js");
const ImageRegex = /(?:([^:/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:png|jpe?g|gifv?|webp|bmp|tiff|jfif))(?:\?([^#]*))?(?:#(.*))?/gi;
const LinkRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;


class PurgeCommand extends Command {
  constructor() {
    super({
      id: "purge",
      description: "clean up to 99 messages.",
      ratelimit: 5,
      category: "moderation",
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"]
    });
  }

  async do(message, args) {
    try {
      const Method = args[0] ? args[0].toLowerCase() : "";
      switch (Method) {
        case "word":
        case "words":
          return words(message, args.slice(1));
        case "user":
        case "member":
          return users(message, args.slice(1));
        case "type":
        case "types":
          return execute(message, args.slice(1));
        default:
          return message.channel.send("`🚫` You entered an invalid option.");
      }

      async function words(message, [inc, amount]) {
        if (!inc) inc = await this.client.nekoyasui.prompt.reply(message.channel, "Provide me a word or phrase to prune!", { userID: message.author.id });
        if (!inc) return;

        if (!amount) amount = await this.client.nekoyasui.prompt.reply(message.channel, "How many messages you want to delete? Max: 99", { userID: message.author.id });
        if (!amount) return;
        const prune = parseInt(amount) + 1;

        if (isNaN(prune)) {
          return message.channel.send("`🚫` That doesn't seem to be a valid number.");
        } else if (prune <= 1 || prune > 100) {
          return message.channel.send("`🚫` You need to input a number between 1 and 99.");
        }

        try {
          const messages = await message.channel.messages.fetch({
            limit: Math.min(prune, 100),
            before: message.id,
          });
          const flushable = messages.filter(m => m.content.toLowerCase().includes(inc));
          if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no messages containing the word **${inc}** in the last ${prune} messages!`);
          await message.channel.bulkDelete(flushable);
          console.log(flushable.content)
          return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned ${flushable.size} ${flushable.size == 1 ? `message containing the word **${inc}**!` : `messages containing the word **${inc}**!`}`);
        }
        catch (err) {
          console.log(err);
          return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");
        }
      }

      async function users(message, [member, amount]) {
        if (!member) member = await this.client.nekoyasui.prompt.reply(message.channel, "Whose member that you want to delete messages?", { userID: message.author.id });
        if (!member) return;

        member = await this.client.nekoyasui.search.member(message, member, { current: true });
        if (!member) return message.channel.send("`🚫` That member cannot be found on this server.");

        if (!amount) amount = await this.client.nekoyasui.prompt.reply(message.channel, "How many messages you want to delete? Max: 99", { userID: message.author.id });
        if (!amount) return;
        const prune = parseInt(amount) + 1;

        if (isNaN(prune)) {
          return message.channel.send("`🚫` That doesn't seem to be a valid number.");
        } else if (prune <= 1 || prune > 100) {
          return message.channel.send("`🚫` You need to input a number between 1 and 99.");
        }

        try {
          const messages = await message.channel.messages.fetch({
            limit: prune,
            before: message.id,
          });
          const flushable = messages.filter(m => m.author.id == member.user.id);
          if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, **${member.user.username}** did not send any messages in the last ${amount} messages!`);

          await message.channel.bulkDelete(flushable);
          return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned ${flushable.size} ${flushable.size == 1 ? `message from **${member.user.username}**!` : `messages from **${member.user.username}**!`}`);
        }
        catch (err) {
          console.log(err);
          return message.channel.send("\`🚫\` These messages are too old to be deleted! I can only delete messages within two weeks!");
        }
      }

      async function execute(message, [type, amount]) {
        if (!type) type = await this.client.nekoyasui.prompt.reply(message.channel, "Provide me a valid type of message to prune!", { userID: message.author.id });
        if (!type) return;

        if (!amount) amount = await this.client.nekoyasui.prompt.reply(message.channel, "How many messages you want to delete? Max: 99", { userID: message.author.id });
        if (!amount) return;
        const prune = parseInt(amount);

        if (isNaN(prune)) {
          return message.channel.send("`🚫` That doesn't seem to be a valid number.");
        } else if (prune <= 1 || prune > 100) {
          return message.channel.send("`🚫` You need to input a number between 1 and 99.");
        }

        if (type == "all") {
          try {
            const messages = await message.channel.messages.fetch({ limit: prune });
            await message.channel.bulkDelete(messages.size, true);
            return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned ${messages.size} ${messages.size == 1 ? "message!" : "messages!"}`);

          }
          catch (err) {
            console.log(err);
            return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

          }
        } else

          if (type == "images" || type == "pics" || type == "image") {
            try {
              const messages = await message.channel.messages.fetch({
                limit: prune,
                before: message.id,
              });

              const attachments = messages.filter(m => ImageRegex.test(m.content));
              const urls = messages.filter(m => m.attachments.size > 0);

              const flushable = attachments.concat(urls);

              if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no images to prune in the last ${prune} messages!`);

              await message.channel.bulkDelete(flushable);

              return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "image!" : "images!"}`);
            }
            catch (err) {
              console.log(err);
              return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

            }

          } else

            if (type == "bots" || type == "bot") {
              try {
                const messages = await message.channel.messages.fetch({
                  limit: prune,
                  before: message.id,
                });
                const flushable = messages.filter(m => m.author.bot);
                await message.channel.bulkDelete(flushable);
                if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no bot messages to prune in the last ${prune} messages!`);

                return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "bot message!" : "bot messages!"}`);
              }
              catch (err) {
                console.log(err);
                return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

              }
            } else

              if (type == "codeblocks" || type == "code") {
                try {
                  const messages = await message.channel.messages.fetch({
                    limit: prune,
                    before: message.id,
                  });
                  const flushable = messages.filter(m => m.content.startsWith("```"));

                  if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no codeblocks to prune in the last ${prune} messages!`);

                  await message.channel.bulkDelete(flushable);
                  return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "codeblock!" : "codeblocks!"}`);
                }
                catch (err) {
                  console.log(err);
                  return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

                }
              } else

                if (type == "attachments" || type == "attachment" || type == "files" || type == "file") {
                  try {
                    const messages = await message.channel.messages.fetch({
                      limit: prune,
                      before: message.id,
                    });
                    const flushable = messages.filter(m => m.attachments.length > 0);
                    if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no attachments to prune in the last ${prune} messages!`);

                    await message.channel.bulkDelete(flushable);
                    return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "attachment!" : "attachments!"}`);
                  }
                  catch (err) {
                    console.log(err);
                    return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

                  }
                } else

                  if (type == "embeds" || type == "embed") {
                    try {
                      const messages = await message.channel.messages.fetch({
                        limit: prune,
                        before: message.id,
                      });
                      const flushable = messages.filter(m => m.embeds.length > 0);
                      if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no embeds to prune in the last ${prune} messages!`);

                      await message.channel.bulkDelete(flushable);
                      return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "embed!" : "embeds!"}`);
                    }
                    catch (err) {
                      console.log(err);
                      return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

                    }
                  } else

                    if (type == "me") {
                      try {
                        const messages = await message.channel.messages.fetch({
                          limit: prune,
                          before: message.id,
                        });
                        const flushable = messages.filter(m => m.id == message.author.id);
                        if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no messages from you to prune in the last ${prune} messages!`);

                        await message.channel.bulkDelete(flushable);
                        return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** of your messages!`);
                      }
                      catch (err) {
                        console.log(err);
                        return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

                      }
                    } else

                      if (type == "link" || type == "links") {
                        try {
                          const messages = await message.channel.messages.fetch({
                            limit: prune,
                            before: message.id,
                          });
                          const flushable = messages.filter((m) => LinkRegex.test(m.content));
                          if (flushable.size == 0) return message.channel.send(`\`🍇\` **${message.author.username}**, there were no links to prune in the last ${prune} messages!`);

                          await message.channel.bulkDelete(flushable);
                          return message.channel.send(`\`🍇\` **${message.author.username}**, successfully pruned **${flushable.size}** ${flushable.size == 1 ? "link!" : "links!"}`);
                        }
                        catch (err) {
                          console.log(err);
                          return message.channel.send("`🚫` These messages are too old to be deleted! I can only delete messages within two weeks!");

                        }
                      } else {
                        return message.channel.send("`🚫` You entered an invalid type of message.");
                      }
      }
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = PurgeCommand;