const report = require('./report.json');

const fs = jest.genMockFromModule('fs');

fs.readFile = (filename, encoding, callback) => {
  if (filename === '/simcraft-data/report.json') {
    callback('', JSON.stringify(report));
  } else {
    callback('', '');
  }
};

module.exports = fs;
