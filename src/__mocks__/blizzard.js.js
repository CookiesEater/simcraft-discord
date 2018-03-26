const character = require('./character.json');

const blizzard = {
  initialize: () => ({
    wow: {
      character: (type, data) => new Promise((resolve, reject) => {
        if (data.name === 'not found') {
          reject(new Error('Not found'));
          return;
        }

        if (data.name === 'healer') {
          character.talents[0].spec.name = 'Свет';
          character.talents[0].spec.role = 'HEALING';
        }

        resolve({ data: character });
      }),
    },
  }),
};

module.exports = blizzard;
