const characterDd = require('./character-dd.json');
const characterHealer = require('./character-healer.json');

const blizzard = {
  initialize: () => ({
    wow: {
      character: (type, data) => new Promise((resolve, reject) => {
        if (data.name === 'notfound') {
          const error = new Error();
          error.response = {
            data: {
              status: 404,
              reason: 'Not found',
            },
          };
          reject(error);
          return;
        }

        if (data.name === 'healer') {
          resolve({ data: characterHealer });
        } else {
          resolve({ data: characterDd });
        }
      }),
    },
  }),
};

module.exports = blizzard;
