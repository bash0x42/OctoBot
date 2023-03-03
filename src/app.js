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

const client = new tmi.Client(options);

/*  PROTECTION DU SYSTEM  */ 

//:: ban tempo ::
const MAX_TIMEOUTS = 3;
const timeoutCount = new Map();

function handleTimeout(channel, username) {
  timeoutCount.delete(username);
  client.ban(channel, username, (SYSTEMBANTEMPO) => `3 timeouts = ban automatique`)
    .then(() => console.log(`Utilisateur ${username} banni après 3 timeouts`))
    .catch((err) => console.log(`Erreur lors du bannissement de l'utilisateur ${username}: ${err}`));
}

client.on('timeout', (channel, userstate, reason, duration) => {
  const { username } = userstate;
  const count = timeoutCount.get(username) || 0;
  timeoutCount.set(username, count + 1);

  if (count + 1 === MAX_TIMEOUTS) {
    handleTimeout(channel, username);
  } else {
    console.log(`Utilisateur ${username} timeout (${count + 1}/${MAX_TIMEOUTS})`);
  }
});

client.connect()
  .then(() => console.log(`Connecté au chat de ${client.getChannels().join(', ')}`))
  .catch((err) => console.log(`Erreur lors de la connexion: ${err}`));




//:: autoban messages ::
const MAX_DELETED_MESSAGES = 3;

// Créer une carte pour stocker le nombre de messages supprimés par utilisateurices.
let deletedMessages = new Map();

// Écouter les événements de suppression de messages.
client.on('messagedeleted', (channel, username, deletedMessage, self) => {
  // Vérifier si le message supprimé provient de l'utilisateurices.
  if (self) {
    // Vérifier si le message a été supprimé par un modérateur ou un administrateur.
    if (deletedMessage.tags['user-id'] !== deletedMessage.tags['target-user-id']) {
      // Récupérer le nombre de messages supprimés pour l'utilisateurices.
      let count = deletedMessages.get(username) || 0;
      // Incrémenter le nombre de messages supprimés et mettre à jour la carte.
      deletedMessages.set(username, count + 1);
      // Si l'utilisateurices a atteint le nombre maximal de messages supprimés, le bannir.
      if (deletedMessages.get(username) === MAX_DELETED_MESSAGES) {
        // Bannir l'utilisateurices avec un message d'explication.
        client.ban(channel, username, (SYSTEMAUTOBANMESSAGES) =>'Trois messages supprimés. Merci de respecter les règles du chat.');
        console.log(`${username} a été banni pour ${MAX_DELETED_MESSAGES} messages supprimés.`);
        // Supprimer l'utilisateurices de la carte des messages supprimés après l'avoir banni.
        deletedMessages.delete(username);
      }
    }
  } else {
    // Si le message supprimé n'a pas été envoyé par l'utilisateurices, supprimer l'utilisateurices de la carte.
    deletedMessages.delete(username);
  }
});

// :: termes & expressions :: // 
const TIMEOUT_DURATION = 600; // en secondes

function checkTwitchChat(userstate, message, channel) {
  console.log(message);
  const messageLowercase = message.toLowerCase();
  for (const blockedWord of BLOCKED_WORDS) {
    if (messageLowercase.includes(blockedWord.toLowerCase())) {
      // Appliquer le timeout à l'utilisateur
      client.timeout(channel, userstate.username, TIMEOUT_DURATION, (SYSTEMSECURE) => "Message contenant un terme bloqué");
      return;
    }
  }
}