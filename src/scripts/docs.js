const fs = require("fs"), pkg = require(`${process.cwd()}/package.json`);

module.exports = async (client) => {
  let docs = `## ${pkg.name}\n`;

  docs += "> Simple bot that will brighten up your server! with fantastic features!\n";
  docs += "> Such as Moderation, Utility, Economy, Chat, and much more!";
  docs += `\n\n`;
  docs += "**Commands**";
  docs += "*(Use `m;help` for an up-to-date version)*";
  docs += `\n\n`;
  docs += "| Commands | Category | Description\n";
  docs += "| ------ | ------ | ------ |\n";

  const categories = removeDuplicates(client.commands.map((c) => c.category));
  for (const category of categories) {
    docs += client.commands.filter((c) => c.category === category).map((command) => `| ${command.id} | ${category ? category.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : "Miscellaneous"} | ${command.description || "No description provided."} |`).join("\n");
  }

  if (fs.existsSync(`${process.cwd()}/docs/commands.md`)) {
    fs.writeFileSync(`${process.cwd()}/docs/commands.md`, docs.trim());
    client.Log().success("Documentations", "Command list updated");
  } else {
    client.Log().warn("Documentations", `Please create 'commands.md' at ${process.cwd()}/docs`);
  }
};

function removeDuplicates(arr) {
  return [...new Set(arr)];
}