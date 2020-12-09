exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, karmaQueue } = index
  let { karmaCache } = index

  const settings = config.karma

  // let cooldown = 15 * 1000 // ms
  // if(commandCooldowns.leaderboard[message.author.id]) {
  //   let cooldownRemaining = new Date() - commandCooldowns.leaderboard[message.author.id]
  //   if(cooldownRemaining < cooldown) {
  //     let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
  //     message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
  //     return
  //   }
  // }

  // commandCooldowns.leaderboard[message.author.id] = new Date()

  const leaderboardEmbed = new Discord.MessageEmbed()
    .setColor("#d223d2")
    .setTitle("Discord Karma Leaderboard")
    .setDescription("*Leaderboard spots are limited by DiscordAPI.*\nFull leaderboard: [Leaderboard Web Panel](g8c-bot.web.app)")
    .setFooter(settings.lang.footer)

  const usersColl = db.collection("users")
  const snapshot = await usersColl.orderBy("karma", "desc").limit(settings.leaderboard.top.total).get()

  if(karmaCache.length === 0) {
    snapshot.forEach(async doc => {
      let user = client.users.cache.find(u => u.id === doc.id)
      const data = doc.data()
  
      if(!user)
        if(data.tag)
          user = `${data.tag}.` // if user's tag is stored
        else
          user = `ID: ${doc.id}` // display as id otherwise
      else
        user = user.tag // if the user is cached and their tag is found
      
      if(user === null)
        user = `ID: ${doc.id}`
  
      let karma = data.karma
  
      karmaCache.push({
        user: user,
        id: doc.id,
        karma: karma,
      })
    })
  }

  const getRankingStr = (rank, isAuthor) => {
    // this function will give medal emojis for the first 3
    // it will return a star if the user is not in the top 3 for the user's entry
    // otherwise, it will just return #rank
    switch(rank) {
      case 1:
        return ":first_place: First Place"
      case 2:
        return ":second_place: Second Place"
      case 3:
        return ":third_place: Third Place"
      default:
        if(isAuthor)
          return `:star: #${rank.toString().padStart(2, "0")}`
        else
          return `#${rank.toString().padStart(2, "0")}`
    }
  }

  karmaCache
    .forEach(field => {
      let rank = karmaCache.indexOf(field) + 1
      let rankingStr = getRankingStr(rank, field.id === message.author.id)

      const { positive, negative } = settings.leaderboard.emojis

      let karma = field.karma
      let emoji = karma > 0 ? positive : negative
      let content = `${emoji} ${karma.toLocaleString()}`

      if(karmaQueue[field.id])
        content += ` and ${karmaQueue[field.id]} pending`
      leaderboardEmbed.addField(`${rankingStr}\n\`${field.user}\``, content + "\n\u200b", rank > settings.leaderboard.top.podium)
      if(rank === settings.leaderboard.top.podium)
        leaderboardEmbed.addField("\u200b", "\u200b")
    })
  
  message.channel.send(leaderboardEmbed)
}