module.exports = (client, message) => {
  const index = require("../index.js")

  console.log("g9lBot Loaded!")

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`for ${index.prefix}h`, { type: "WATCHING" })

  setInterval(() => {
    index.propaganda()
  }, 5 * 60 * 1000)
}