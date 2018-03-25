const debug = require('debug');

const error = debug('bot:error');

module.export = (client, event) => {
  error(`Disconnect: code ${event.code}, reason "${event.reason}"`);

  // Вход заново если discord закрыл соединение нормально
  if (event.code === 1000) {
    client.login(process.env.DISCORD_KEY);
  }
};
