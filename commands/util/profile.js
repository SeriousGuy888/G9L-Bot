exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord, getUserArg, embedder, badger } = index

  const user = await getUserArg(message)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setThumbnail(user.avatarURL({ dynamic: true, size: 2048 }))
  embedder.addAuthor(emb, user, `%tag%'s ${config.main.botNames.lowerCamelCase} Profile`)

  const { knownGuilds } = config.main
  let mutualGuilds = []
  for(const guildId in knownGuilds) {
    const guild = await client.guilds.fetch(guildId).catch(() => {})
    const member = await guild.members.fetch(user.id).catch(() => {})

    if(member)
      mutualGuilds.push(`${knownGuilds[guildId]}`)
  }
  emb.addField("Member of", mutualGuilds.join("\n"))

  const badges = await badger.getBadges(user.id)
  let badgeContent = ""
  if(badges.length) {
	  for(const badge of badges) {
      const badgeInfo = config.badges[badge]
      const badgeDesc = badgeInfo?.description || "No description"
      const badgeEmoji = badgeInfo?.emoji + " " || ""
	  	badgeContent += `**${badgeEmoji}${badge.toUpperCase()}**\n${badgeDesc}\n\n`
	  }
  }
  emb.addField("Badges", (badgeContent || "This user does not have any badges.") + `\n[What are badges?](${config.main.links.github_pages}#faq-badges)`)


  message.channel.send(emb)
}

exports.cooldown = 30