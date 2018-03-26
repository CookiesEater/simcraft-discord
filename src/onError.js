const debug = require('debug');

const error = debug('bot:error');

module.exports = (err) => {
  error('Error: %s', err.toString());
};
