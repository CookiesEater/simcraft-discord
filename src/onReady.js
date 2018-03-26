const debug = require('debug');
const Simcarft = require('./components/Simcraft');

const log = debug('bot:log');
log.log = console.log.bind(console); // eslint-disable-line no-console

module.exports = async (client) => {
  log('I\'m ready! My id is %s', client.user.id);

  const data = await (new Simcarft()).info();
  client.user.setActivity(data);
};
