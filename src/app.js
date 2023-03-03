import tmi from 'tmi.js'
import { BOT_USERNAME, OAUTH_TOKEN, CHANNEL_NAME } from './security/settings'
import { BLOCKED_WORDS } from './moderations/constants'


const options = {
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
    timeout: 180000,
    reconnectDecay: 1.4,
    reconnectInterval: 1000,
  },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [CHANNEL_NAME]
}
const deletedMessages = new Map();
const client = new tmi.Client(options);
client.connect();
// GESTIONS EVENTS //
client.on('disconnected', (reason) => {
  onDisconnectedHandler(reason)
})

client.on('connected', (address, port) => {
  onConnectedHandler(address, port)

})

// EVENT LOGS Connected && Disconnected //
function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`)
}

function onConnectedHandler(address, port) {
  console.log(`Connected: ${address}:${port}`)
}

// EVENT TCHAT TERMS & EXPRESSIONS //
client.on('message', (channel, userstate, message, self) => {
  if (self) {
    return
  }
  onMessageHandler(channel, userstate, message, self);
})

function onMessageHandler(channel, userstate, message, self) {
  checkTwitchChat(userstate, message, channel)
}



/*
              EVENTS DU SYSTEM ( :: bit :: subs :: subgift :: anongift :: raid :: )
*/ 

// Événement lorsqu'un.e utilisateurices fait une donation.
client.on('cheer', (channel, tags, message) => {
  const username = tags.username;
  const amount = tags.bits;

  client.say(channel, `Merci à ${username} pour sa donation de ${amount} bits !`);
});

// Événement lorsqu'un.e utilisateurices s'abonne.
client.on('subscription', (channel, username, methods, message, userstate) => {
  const subMonths = userstate['msg-param-cumulative-months'];
  const subPlan = userstate['msg-param-sub-plan-name'];

  client.say(channel, `Merci à ${username} pour son abonnement ${subPlan} (${subMonths} mois consécutifs) !`);
});

// Événement lorsqu'un.e utilisateurices offre un abonnement à un autre utilisateurices.
client.on('subgift', (channel, username, recipient, methods, userstate) => {
  const subPlan = userstate['msg-param-sub-plan-name'];

  client.say(channel, `Merci à ${username} pour l'abonnement cadeau de ${subPlan} à ${recipient} !`);
});

// Événement lorsqu'un.e utilisateurices offre des abonnements mystères à une ou plusieurs utilisateurices.
client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) => {
  const recipient = userstate['msg-param-recipient-display-name'];

  client.say(channel, `Merci à ${username} pour l'abonnement mystère à ${numbOfSubs} abonnés, dont ${recipient} !`);
});

// Événement lorsqu'un.e utilisateurices raid votre chaîne
client.on('raided', (channel, username) => {
  client.say(channel, `${username} , Merci pour le raid !`);
});


/*
              PROTECTION DU SYSTEM ( :: automods :: ban tempo :: ban def  :: termes & expressions :: automods links :: )
*/ 

// :: ban auto si 3 to :: //
let timeoutCount = {};
client.on('timeout', (channel, username) => {
  // Vérifier si l'utilisateurices a déjà été timeout.
  if (timeoutCount[username]) {
    timeoutCount[username]++;
  } else {
    timeoutCount[username] = 1;
  }

  // Si l'utilisateurices a été timeout 3 fois, le bannir.
  if (timeoutCount[username] >= 3) {
    client.ban(channel, username, (SafetyCenterSystem) => `3 Timeout = BAN AUTO`);
    timeoutCount[username] = 0;
  }
});

// :: ban def si message sup (3 messages sup = Ban) :: //
client.on('messagedeleted', (channel, username, deletedMessage, self) => {
  // Vérifie si le message provient de l'utilisateurices.
  if (self) {
    // Récupère le nombre de messages supprimés pour l'utilisateurices.
    let count = deletedMessages.get(username) || 0;
    // Incrémenter le nombre de messages supprimés et mise à jour de la carte.
    deletedMessages.set(username, count + 1);
    // Si l'utilisateurices a atteint le nombre maximal de messages supprimés, le ban sonne.
    if (deletedMessages.get(username) === 3) {
      client.ban(channel, username, (ban) => 'Propos Problématiques');
      console.log(`${username} a été Banni → Voir les logs messages`);
      // Supprimer l'utilisateurices de la carte des messages supprimés après l'avoir ban.
      deletedMessages.delete(username);
    }
  } else {
    deletedMessages.delete(username);
  }
});

// :: termes & expressions :: // 
function checkTwitchChat(userstate, message, channel) {
  console.log(message)
  message = message.toLowerCase()
  let shouldSendMessage = false
  shouldSendMessage = BLOCKED_WORDS.some(blockedWord => message.includes(blockedWord.toLowerCase()));
  if (shouldSendMessage) {
    client.deletemessage(channel, userstate.id)
  }
}