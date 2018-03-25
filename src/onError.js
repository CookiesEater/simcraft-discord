const debug = require('debug');

const error = debug('bot:error');

module.export = (err) => {
  error('Error: %s', err.toString());
};
