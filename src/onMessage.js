const debug = require('debug');
const Command = require('./components/Command');
const Simcarft = require('./components/Simcraft');
const Simulation = require('./components/Simulation');
const Character = require('./components/Character');

const error = debug('bot:error');
const log = debug('bot:log');

log.log = console.log.bind(console); // eslint-disable-line no-console

module.export = async (client, message) => {
  if (!message.isMentioned(client.user)) {
    return;
  }

  log(`New message ${message.content}`);
  const command = new Command(message.content);
  if (command.info) {
    log('Send info message');
    const data = await (new Simcarft()).info();

    message.channel.send(`Я использую версию симкрафт:\n${data}`);
    return;
  }
  if (command.name === null) {
    return;
  }

  const character = new Character(command.name, command.realm, command.origin);
  try {
    log(`Fetch information about character ${character.getFullName()}`);
    await character.load();
  } catch (err) {
    error(`Fail fetch data from Blizzard api. Status: ${err.response.data.status}, reason: ${err.response.data.reason}`);
    message.reply(`Blizzard говорит что персонажа ${character.getFullName()} нет. Где-то ошибка в имени?`);
    return;
  }

  // Если текущая специализация хила то только выводим что симкрафт не работает с ней
  if (character.isHealer()) {
    log('Heal spec can\'t simulate');
    message.reply(`Персонаж ${character.getFullName()} находится в специализации лекаря. SimulationCraft не умеет считать HPS.`);
    return;
  }

  // Симуляция
  const simulation = new Simulation(character);
  simulation.setEnemies(command.enemies);
  if (command.pawn) {
    simulation.setScaling();
  }
  try {
    log(`Start simcraft for ${character.getFullName()}...`);
    message.channel.send(simulation.getStartMessage(message.author));
    await simulation.simulate();
    log(`Simulate for ${character.getFullName()} end successful`);
    message.channel.send(simulation.getEndMessage(message.author));
  } catch (err) {
    error(`An error during simulate ${character.getFullName()}: ${err.message}`);
    message.reply('В процессе симуляции что-то пошло не так, скорая уже выехала.');
  }
};
