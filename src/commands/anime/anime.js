const Command = require("../../struct/command.js");
const aq = require("animequote");
const Kitsu = require("kitsu.js");
const kitsu = new Kitsu();
const moment = require("moment");

class AnimeCommand extends Command {
  constructor() {
    super({
      id: "anime",
      description: "Searches for an anime on Kitsu.io! If no anime name is given, it gives you a random suggestion!",
      ratelimit: 5,
      category: "anime"
    });
  }

  async do(message, [...search]) {
    try {
      search = search.join(" ").trim();
      if (!(search)) {
        kitsu.searchAnime(aq().quoteanime).then((result) => {

          const anime = result[0];
          const embed = this.client.BaseEmbed(message);
          embed.setAuthor("Kitsu", "https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png", `https://kitsu.io/anime/${anime.slug}`);
          //embed.setAuthor(`${anime.titles.english} | ${anime.showType}`, anime.posterImage.original);
          embed.setTitle(`${anime.titles.english ? anime.titles.english : anime.titles.romaji} | ${anime.showType ? anime.showType : ""}`);
          embed.setThumbnail(anime.posterImage.original);
          embed.setDescription(anime.synopsis.replace(/<[^>]*>/g, "").split("\n")[0]);
          embed.addField("❯\u2000Information", `•\u2000**Japanese Name:** ${anime.titles.romaji}\n•\u2000**Age Rating:** ${anime.ageRating}\n•\u2000**NSFW:** ${anime.nsfw ? "Yes" : "No"}`);
          embed.addField("❯\u2000Stats", `•\u2000**Average Rating:** ${anime.averageRating}\n•\u2000**Rating Rank:** ${anime.ratingRank}\n•\u2000**Popularity Rank:** ${anime.popularityRank}`);
          embed.addField("❯\u2000Status", `•\u2000**Episodes:** ${anime.episodeCount ? anime.episodeCount : "N/A"}\n•\u2000**Start Date:** ${moment(anime.startDate).format("LL")}\n•\u2000**End Date:** ${anime.endDate ? moment(anime.endDate).format("LL") : "Still airing"}`);
          message.channel.send(`\`📺\` Try watching **${anime.titles.english}**!\n`, { embed: embed });
        }).catch((e) => { this.client.nekoyasui.logs(message, e, "error"); });
        return;
      }
      kitsu.searchAnime(search).then((result) => {
        if (result.length === 0) return message.channel.send(`\`🚫\` No search results found, maybe try searching for something that exists.`);

        const anime = result[0];
        const embed = this.client.BaseEmbed(message);
        embed.setAuthor("Kitsu", "https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png", `https://kitsu.io/anime/${anime.slug}`);
        //embed.setAuthor(`${anime.titles.english ? anime.titles.english : search} | ${anime.showType}`, anime.posterImage.original);
        embed.setTitle(`${anime.titles.english ? anime.titles.english : search} | ${anime.showType ? `${anime.showType}` : ""}`);
        embed.setThumbnail(anime.posterImage.original);
        embed.setDescription(anime.synopsis.replace(/<[^>]*>/g, "").split("\n")[0]);
        embed.addField("❯\u2000Information", `•\u2000**Japanese Name:** ${anime.titles.romaji}\n•\u2000**Age Rating:** ${anime.ageRating}\n•\u2000**NSFW:** ${anime.nsfw ? "Yes" : "No"}`, true);
        embed.addField("❯\u2000Stats", `•\u2000**Average Rating:** ${anime.averageRating}\n•\u2000**Rating Rank:** ${anime.ratingRank}\n•\u2000**Popularity Rank:** ${anime.popularityRank}`);
        embed.addField("❯\u2000Status", `•\u2000**Episodes:** ${anime.episodeCount ? anime.episodeCount : "N/A"}\n•\u2000**Start Date:** ${moment(anime.startDate).format("LL")}\n•\u2000**End Date:** ${anime.endDate ? moment(anime.endDate).format("LL") : "Still airing"}`);
        message.channel.send("", { embed: embed });
      }).catch((e) => { this.client.nekoyasui.logs(message, e, "error"); });
      return;
    } catch (e) {
      return this.client.nekoyasui.logs(message, e, "error");
    }
  }
}

module.exports = AnimeCommand;