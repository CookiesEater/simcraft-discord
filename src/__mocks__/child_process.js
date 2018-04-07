const childProcess = {
  spawn: jest.fn((process, params) => {
    let exitCode = 0;
    if (params.indexOf('armory=eu,fail,fail') !== -1) {
      exitCode = 1;
    }

    return {
      on: (event, callback) => {
        if (event === 'close') {
          callback(exitCode);
        }
      },
      stdout: {
        on: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
      },
    }
  }),
};

module.exports = childProcess;
