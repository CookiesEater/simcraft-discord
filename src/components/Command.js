class Command {
  /**
   * @param {String} msg
   */
  constructor(msg) {
    this.command = msg;
    this.info = false;
    this.pawn = false;
    this.enemies = 1;
    this.name = '';
    this.realm = process.env.DEFAULT_REALM;
    this.origin = process.env.DEFAULT_ORIGIN;

    this.prepare();
    this.parse();
  }

  /**
   * Парсит команду.
   */
  parse() {
    let { command } = this;
    if (command === 'инфо') {
      this.info = true;
    }

    if (command.indexOf('pawn') !== -1) {
      this.pawn = true;
      command = command.replace(/pawn/, '').trim();
    }

    if (command.match(/(\d+) цел(ь|и|ей)/)) {
      this.enemies = parseInt(this.command.match(/(\d+) цел(ь|и|ей)/)[1], 10);
      command = command.replace(/\d+ цел(ь|и|ей)/, '').trim();
    }

    if (command) {
      [, this.name, , this.realm = process.env.DEFAULT_REALM, , this.origin = process.env.DEFAULT_ORIGIN] = command.match(/^([^-\s]+)([-\s]+(.+?)([-\s]+(eu|us|kr|tw))?)?$/i);
    }
  }

  /**
   * Подготовка сообщения.
   */
  prepare() {
    this.command = this.command
      // Удаление всех упоминаний и текста до него
      .replace(/.*<@\d+>/, '')
      // Удаление спец символов
      .replace(/[.?!,:;]/g, '')
      .trim()
      .toLowerCase();
  }
}

module.exports = Command;
