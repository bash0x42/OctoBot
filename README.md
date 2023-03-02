# OctoBot
OctoBot → Vous aide dans votre modération twitch [Débutant - Intermédiaire]



Avant de commencer à utiliser ce petit Octobot veiller à avoir d'installer sur votre machaine le nécessaire pour le bon fonctionnement mais aussi de bien paramétrer Octobot

Pour cela rien de plus simple:
Télécharger & installer: **(Liens officiels)**
- [NPM / NODE](https://nodejs.org/en/download/) 
- [YARN](https://chore-update--yarnpkg.netlify.app/fr/docs/install)
- [VSCODE](https://code.visualstudio.com/download)

Une fois cela effectué vous avez fait le plus dur maintenant passosn au paramétrage d'Octobot.
dans la partie **settings**: (Suivez juste les instructions en commentaires)

```
security/settings.js → Paramétrages
 ```

```js
 export const CHANNEL_NAME = '#channel';  // Mettre le nom du live où vous êtes modératrices ou diffuseurs exemple '#lepetitcompte'
export const OAUTH_TOKEN = 'oauth:blablabla........'; // Mettre votre clé OAUTH générer grâce à → 'https://twitchapps.com/tmi/'
export const BOT_USERNAME = 'compte'; // Le nom de votre compte ou le nom de compte que vous souhaitez utiliser pour la modération
```
Une fois tout ceci mis en place, comment le mettre en fonction ? 
Pour cela rien de plus simple, vous avez deux commandes à taper dans VScode via l'onglet **Terminal**

**Terminal → nouveau terminal**

``` 
npm install
```
(La commande '**npm install**' va vous créer un dossier de nom de '**node_modules**', obligatoire pour le fonctionnement d'Octobot).

ainsi que 
```
yarn  start
```
Si vous avez tout bien installé & paramétrer via le terminal vous devrait avoir ceci (exemple):

```
$ yarn start
yarn run v1.22.19
$ node .
[11:42] info: Connecting to irc-ws.chat.twitch.tv on port 443..
[11:42] info: Sending authentication to server..
[11:42] info: Connected to server.
Connected: irc-ws.chat.twitch.tv:443
[11:42] info: Executing command: JOIN #potite_bulle
[11:42] info: Joined #potite_bulle
```