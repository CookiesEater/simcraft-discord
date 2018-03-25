const debug = require('debug');
const Simcarft = require('./components/Simcraft');

const log = debug('bot:log');
log.log = console.log.bind(console); // eslint-disable-line no-console

module.export = async (client) => {
  log('I\'m ready! My id is %s', client.user.id);

  const simcraft = new Simcarft('', '', '');
  const data = await simcraft.info();
  client.user.setGame(data);
};
