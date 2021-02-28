exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { embedder } = client.util
  
  let gameData = index.gameCache.blackjack
  let userData = gameData[message.author.id]
  
  
  class Card {
    constructor(suit, number) {
      this.suit = suit
      this.number = number
    }

    getSuit() {
      return this.suit
    }

    getNumber() {
      return this.number
    }
  }
  class CardCollection {
    constructor(cards) {
      this.cards = cards ?? []
    }

    toString() {
      let output = []
      for(const card of this.cards) {
        output.push(card.getNumber() + suits[card.getSuit()])
      }
      return output.join(", ")
    }

    add(card) {
      this.cards.push(card)
      return this
    }
  }
  class Deck extends CardCollection {
    draw() {
      const cardIndex = Math.floor(Math.random() * this.cards.length)
      const card = this.cards[cardIndex]
  
      this.cards.splice(cardIndex, 1)
      return card
    }
  }
  class Hand extends CardCollection {
    getValue() {
      let cards = this.cards

      const aces = []
      for(const i in cards) {
        if(cards[i].number === "A") {
          aces.push(cards[i])
          cards.splice(i, 1)
        }
      }

      let value = 0
      for(const i in cards) {
        if(cards[i].number.match(/[JQK]/)) {
          value += 10
        }
        else {
          value += parseInt(cards[i].number)
        }
      }

      aces.forEach(() => {
        if(value + 11 > 21)
          value += 1
        else
          value += 11
      })

      return value
    }
  }




  if(!userData) {
    userData = {
      deck: new Deck(),
      hand: new Hand(),
      dealer: new Hand()
    }
    message.channel.send("created new game instance for you")
  }


  const suits = {
    "spades": "♤",
    "hearts": "♡",
    "clubs": "♧",
    "diamonds": "♢"
  }

  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  for(const suit in suits) {
    for(const number of numbers) {
      userData.deck.add(new Card(suit, number))
    }
  }

  const checkWin = () => { // https://en.wikipedia.org/wiki/Blackjack#Rules
    const { hand, dealer } = userData

    const handVal = hand.getValue()
    const dealerVal = dealer.getValue()

    if(handVal > 21)
      return -1
    if(dealerVal > 21)
      return 1
    if(dealerVal === 21)
      return -1
    
    return 0
  }
    const winner = checkWin()

    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setTitle("Blackjack")
      .addField("🏠 Dealer's Hand", `${userData.dealer.toString()}\nTotal: ${userData.dealer.getValue()}`)
      .addField("✋ Your Hand", `${userData.hand.toString()}\nTotal: ${userData.hand.getValue()}`)
    
    if(!winner) {
      emb
        .setColor("#ffff00")
        .setDescription(`remaining in deck: ${userData.deck.toString()}`)
        .setFooter("Gambling is always a good idea.")
    }
    else {
      if(winner > 0) {
        emb
          .setColor("#00ff00")
          .setDescription("You win.")
      }
      else {
        emb
          .setColor("#ff0000")
          .setDescription("You lose.")
      }
    }
    
    return emb
  }

  const makeDealerChoice = () => {
    if(userData.dealer.getValue() < 17) {
      userData.dealer.add(userData.deck.draw())
    }
  }


  userData.hand
    .add(userData.deck.draw())
    .add(userData.deck.draw())
  userData.dealer
    .add(userData.deck.draw())
    .add(userData.deck.draw())
  
  const msg = await message.channel.send(gameDisplay())

  const emojis = ["🔨", "🧍"]
  emojis.forEach(async emoji => await msg.react(emoji))

  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
  msg.createReactionCollector(filter, { time: 20000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      switch(reaction.emoji.name) {
        case "🔨":
          userData.hand.add(userData.deck.draw())
          break
        case "🧍":
          break
      }
      makeDealerChoice()

      msg.edit(gameDisplay())
    })
    .on("end", async collected => {
      msg.edit("No longer collecting reactions.")
      delete gameData[message.author.id]
    })
}