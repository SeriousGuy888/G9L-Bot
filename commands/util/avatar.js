exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder } = client.util
  const { getUserArg } = client.functions

  const user = await getUserArg(message)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setDescription("Here you go!")
    .setImage(user.avatarURL({ dynamic: true, size: 2048 }))
  embedder.addAuthor(emb, user, "%tag%'s Avatar")

  message.channel.send(emb)
}