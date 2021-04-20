const index = require("../index.js")
const { db } = index

const axios = require("axios")

exports.ping = async (host, port) => {
  const serverAddress = `${host}:${parseInt(port) || 25565}`
  const responseData = (await axios.get(`https://api.mcsrvstat.us/2/${serverAddress}`)).data

  return responseData
}

exports.pingMinehut = async (name) => {
  const response = (await axios.get(`https://api.minehut.com/server/${name}?byName=true`))

  if(response.status === 200) {
    let responseData = response.data.server

    const pluginsData = await axios.get("https://api.minehut.com/plugins_public")
    if(pluginsData.data && pluginsData.data.all) {
      const allPlugins = pluginsData.data.all

      let decodedPlugins = []
      for(const plugin of allPlugins) {
        for(const pluginId of responseData.active_plugins) {
          if(plugin._id === pluginId) {
            decodedPlugins.push(`${plugin.name} \`${plugin.version}\``)
          }
        }
      }

      responseData.plugins = decodedPlugins.sort()
    }
    return responseData
  }
  else {
    return null
  }
}

exports.recordMinehut = async (name, collectionName) => {
  const responseData = await this.pingMinehut(name)
  const collRef = db
    .collection("stats")
    .doc("minecraft_track")
    .collection(collectionName)

  const currentDate = new Date()
  const currentIsoDate = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth() + 1}-${currentDate.getUTCDate()}`
  const docRef = collRef.doc(currentIsoDate)


  if(!responseData) {
    return
  }


  const serverOnline = responseData.online

  let payload = {}
  payload[`${currentDate.getUTCHours().toString().padStart(2, "0")}${currentDate.getUTCMinutes().toString().padStart(2, "0")}`] = {
    online: serverOnline,
    players: {
      online: serverOnline ? responseData.playerCount : 0,
      max: serverOnline ? responseData.maxPlayers : 0,
    }
  }

  docRef.set(payload, { merge: true })
}