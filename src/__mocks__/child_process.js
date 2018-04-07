const childProcess = {
  spawn: jest.fn(),
};
childProcess.spawn.mockReturnValue({
  on: (event, callback) => {
    if (event === 'close') {
      callback(0);
    }
  },
  stdout: {
    on: jest.fn(),
  },
  stderr: {
    on: jest.fn(),
  },
});

module.exports = childProcess;
