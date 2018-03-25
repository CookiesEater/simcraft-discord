const debug = require('debug');
const blizzard = require('blizzard.js').initialize({ apikey: process.env.BATTLE_NET_KEY }, {});
const numeral = require('numeral');
const moment = require('moment-timezone');
const ucfirst = require('./helpers/ucfirst');
const pawn = require('./helpers/Pawn');
const Command = require('./components/Command');
const Simcarft = require('./components/Simcraft');

const locale = process.env.LOCALE ? process.env.LOCALE : 'ru_RU';
const timezone = process.env.TIMEZONE ? process.env.TIMEZONE : 'Europe/Moscow';
const reportsUrl = process.env.REPORTS_URL ? process.env.REPORTS_URL : '';
const SPEC_HEALING = 'HEALING';
const error = debug('bot:error');
const log = debug('bot:log');

log.log = console.log.bind(console); // eslint-disable-line no-console
moment.tz.setDefault(timezone);
moment.locale(locale);

module.export = async (client, message) => {
  if (!message.isMentioned(client.user)) {
    return;
  }

  log(`New message ${message.content}`);
  const command = new Command(message.content);
  let character;

  // Если просто выводим служебную информацию
  if (command.info) {
    log('Send info message');
    const data = await (new Simcarft()).info();

    message.channel.send(`Я использую версию симкрафт:\n${data}`);
    return;
  }

  // Нет имени - нет ничего
  if (command.name === null) {
    return;
  }

  try {
    log('Fetch information about character "%s", realm "%s", origin "%s"', command.name, command.realm, command.origin);
    character = (await blizzard.wow.character(['talents'], {
      name: command.name,
      realm: command.realm,
      origin: command.origin,
      locale,
    })).data;
  } catch (err) {
    error('Fail fetch data from Blizzard api. Status: %s, reason: %s', err.response.data.status, err.response.data.reason);
    message.reply(`Blizzard говорит что персонажа ${command.name}-${command.realm}-${command.origin} нет. Где-то ошибка в имени?`);
    return;
  }

  // Поиск названия активной специализации
  const { spec } = character.talents.find(specialization => specialization.selected);
  // Название для файла с итоговым отчётом
  const reportName = reportsUrl ? `${command.name.toLowerCase()}-${command.realm.toLowerCase().replace(/\s+/g, '-')}-${command.origin.toLowerCase()}` : '';

  // Если текущая специализация хила то только выводим что симкрафт не работает с ней
  if (spec.role === SPEC_HEALING) {
    log('Heal spec can\'t simulate');
    message.reply(`Персонаж ${ucfirst(command.name)}-${ucfirst(command.realm)}-${command.origin} находится в специализации лекаря. SimulationCraft не умеет и не будет уметь считать HPS.`);
    return;
  }

  message.channel.send({
    embed: {
      color: 15265561,
      author: {
        name: message.author.tag,
        icon_url: message.author.avatarURL,
      },
      description: `Начинаю симуляцию для персонажа **${ucfirst(command.name)}-${ucfirst(command.realm)}-${command.origin}**`,
      thumbnail: {
        url: `https://render-${command.origin}.worldofwarcraft.com/character/${character.thumbnail}`,
      },
      fields: [
        {
          name: 'Количество целей:',
          value: command.targets.toString(),
          inline: true,
        },
        {
          name: 'Текущая специализация:',
          value: spec.name,
          inline: true,
        },
        {
          name: 'Последнее обновление персонажа:',
          value: moment(character.lastModified).format('DD MMM YYYY г., HH:mm:ss Z'),
          inline: true,
        },
      ],
      footer: {
        text: 'Симуляция займёт какое-то время...',
      },
    },
  });

  // Старт симуляции
  try {
    log(`Start simcraft for ${command.name}...`);
    const simcraft = new Simcarft(command.name, command.realm, command.origin, reportName, command.pawn, command.targets);
    const embed = {
      color: 1552707,
      author: {
        name: message.author.tag,
        icon_url: message.author.avatarURL,
      },
      description: `Симуляция для персонажа **${ucfirst(command.name)}-${ucfirst(command.realm)}-${command.origin}** завершена`,
      thumbnail: {
        url: `https://render-${command.origin}.worldofwarcraft.com/character/${character.thumbnail}`,
      },
      fields: [],
    };
    const data = await simcraft.simulate();
    log(`Simulate for ${command.name} end successful`);

    if (command.targets > 1) {
      embed.fields.push({
        name: 'DPS:',
        value: numeral(data.sim.players[0].collected_data.dps.mean).format('0.00a'),
        inline: true,
      });
      embed.fields.push({
        name: 'DPS (в основную цель):',
        value: numeral(data.sim.players[0].collected_data.prioritydps.mean).format('0.00a'),
        inline: true,
      });
    } else {
      embed.fields.push({
        name: 'DPS:',
        value: numeral(data.sim.players[0].collected_data.dps.mean).format('0.00a'),
        inline: true,
      });
    }

    if (command.pawn) {
      let primaryStatName;
      let primaryStatValue;

      if (data.sim.players[0].scale_factors.Int) {
        primaryStatName = 'Intellect';
        primaryStatValue = data.sim.players[0].scale_factors.Int;
      } else if (data.sim.players[0].scale_factors.Str) {
        primaryStatName = 'Strength';
        primaryStatValue = data.sim.players[0].scale_factors.Str;
      } else if (data.sim.players[0].scale_factors.Agi) {
        primaryStatName = 'Agility';
        primaryStatValue = data.sim.players[0].scale_factors.Agi;
      }

      embed.fields.push({
        name: 'Вес статов:',
        value: `\`\`\`${pawn({
          name: ucfirst(command.name),
          class: data.sim.players[0].specialization.match(/\s+(.+)/)[1].replace(/\s+/, ''),
          spec: data.sim.players[0].specialization.split(' ')[0],
          crit: data.sim.players[0].scale_factors.Crit,
          haste: data.sim.players[0].scale_factors.Haste,
          mastery: data.sim.players[0].scale_factors.Mastery,
          versatility: data.sim.players[0].scale_factors.Vers,
          primaryStatName,
          primaryStatValue,
        }).toString()}\`\`\``,
      });
    }

    if (reportsUrl) {
      embed.fields.push({
        name: 'Подробнее:',
        value: `${reportsUrl}/${reportName}.html`,
      });
    }

    message.channel.send({ embed });
  } catch (err) {
    error(`An error during simulate ${command.name}: ${err.message}`);
    message.reply('В процессе симуляции что-то пошло не так, скорая уже выехала.');
  }
};
