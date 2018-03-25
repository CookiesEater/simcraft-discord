const Discord = require('discord.js');
const onReady = require('./onReady');
const onError = require('./onError');
const onDisconnect = require('./onDisconnect');
const onReconnecting = require('./onReconnecting');
const onMessage = require('./onMessage');

const client = new Discord.Client();

client.on('ready', () => onReady(client));
client.on('error', err => onError(err));
client.on('disconnect', event => onDisconnect(client, event));
client.on('reconnecting', () => onReconnecting());
client.on('message', message => onMessage(client, message));

client.login(process.env.DISCORD_KEY);
