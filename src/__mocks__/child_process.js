const child_process = {
  spawn: jest.fn(),
};
child_process.spawn.mockReturnValue({
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

module.exports = child_process;
