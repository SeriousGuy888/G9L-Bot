module.exports = (message) => {
  const index = require("../index.js")
  const { client, config, banker } = index
  const { messenger, badger } = client.util

  const legal = () => message.attachments.array().length === 0

  const cultLegal = (content, phrase) => {
    const liamCult = () => {
      const leagues = config.coopchannels.liamLeagues
      messenger.dm("427925505581383721", leagues[Math.floor(Math.random() * 64)])
    }

    content = content.toLowerCase()
    phrase = phrase.toLowerCase()
    if(content == phrase && legal()) {
      if(message.author.id !== "427925505581383721") liamCult()
      return true
    }
  }
  const owsLegal = content => {
    content = content.toLowerCase().replace(/[^a-z ]/gi, "")
    if(content.split(" ").length != 1)
      return false
    return legal()
  }

  if(message.author.id === client.user.id)
    return

  switch(message.channel.id) {
    case config.coopchannels.cult.channel:
      if(cultLegal(message.content, config.coopchannels.cult.phrase))
        return
      this.punish(message, "cult", [
        config.coopchannels.cult.phrase,
        message.content
      ])
      break
    case config.coopchannels.ows.channel:
      if(owsLegal(message.content)) {
        // random amount of money between 0 and 0.1
        banker.addToBalance(message.author.id, parseFloat((Math.random() * 0.1).toFixed(2)))
        badger.awardBadge(message.author.id, "storyteller", false, "contributing to the one word story")
        return
      }
      this.punish(message, "ows")
      break
    // case config.coopchannels.counting.channel:
    //   console.log("aaaaaadsfaa")
    //   setTimeout(async () => {
    //     const msg = await message.fetch(true)
    //     if(!msg)
    //       return
        
    //     console.log("aaaa")
    //     messenger.dm(message.author, "test")
    //   }, 2000)
    //   break
  }
}

exports.deleteMessage = (message, errorMessage) => {
  const index = require("../index.js")
  const { client } = index
  const messenger = client.util.messenger

  if(!message.author.bot)
    messenger.dm(message.author.id, errorMessage)
  message.delete({ timeout: 500 })
}

exports.punish = (message, mode, placeholders) => {
  if(!message || !mode)
    throw Error("Specify message and mode to penalize.")
  
  let scoldingMessage = "co-op error0"
  switch(mode) {
    case "cult":
      if(!placeholders) {
        scoldingMessage = "co-op error1"
        break
      }
      scoldingMessage = `Hey, so you seem to have misspelt \`${placeholders[0]}\`. Don't worry, \`${placeholders[1]}\` is a very common misspelling (definitely). I've gone ahead and nuked your message. Try to be a better ~~cult~~ league member next time.`
      break
    case "ows":
      scoldingMessage = `Your contribution to the one word story may only **be one word** and you **may not have attachments**.`
      break
    default:
      scoldingMessage = "co-op error2"
      break
  }
  
  this.deleteMessage(message, scoldingMessage)
}
