class Command {
  /**
   * @param {String} msg
   */
  constructor(msg) {
    this.command = msg;
    this.info = false;
    this.pawn = false;
    this.targets = 1;
    this.name = null;
    this.realm = process.env.DEFAULT_REALM;
    this.origin = process.env.DEFAULT_ORIGIN;

    this.clear();
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

    if (command.indexOf(' pawn') > 0) {
      this.pawn = true;
      command = command.replace(/ pawn/, '').trim();
    }

    if (command.match(/(\d+) цел(ь|и|ей)/)) {
      this.targets = parseInt(this.command.match(/(\d+) цел(ь|и|ей)/)[1], 10);
      command = command.replace(/\d+ цел(ь|и|ей)/, '').trim();
    }

    [, this.name, , this.realm = process.env.DEFAULT_REALM, , this.origin = process.env.DEFAULT_ORIGIN] = command.match(/^([^-\s]+)([-\s]+(.+?)([-\s]+(eu|us|kr|tw))?)?$/i);
  }

  /**
   * Очистка сообщения от мусора
   */
  clear() {
    this.command = this.command
      // Удаление всех упоминаний и спец символов
      .replace(/(<@\d+>|[.?!,])/g, '')
      .trim()
      .toLowerCase();
  }
}

module.exports = Command;
