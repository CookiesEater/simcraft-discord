const debug = require('debug');

const log = debug('bot:log');
log.log = console.log.bind(console); // eslint-disable-line no-console

module.exports = () => {
  log('Trying to reconnect...');
};
