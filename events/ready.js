module.exports = (client, message) => {
  const index = require("../index.js")
  const prefix = index.prefix

  console.log("g9lBot Loaded!")

  const statuses = [
    `for ${prefix}help`,
    "InsomniCheez",
    "Hi, I'm InsomniCheez Lite"
  ]

  let statusIndex = -1
  setInterval(() => {
    statusIndex++
    if(statusIndex >= statuses.length) statusIndex = 0
    client.user.setActivity(statuses[statusIndex], { type: "WATCHING" })
  }, 10000)
}