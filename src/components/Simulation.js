const Discord = require('discord.js');
const moment = require('moment-timezone');
const numeral = require('numeral');
const Simcarft = require('./Simcraft');
const ucfirst = require('./../helpers/ucfirst');
const pawn = require('./../helpers/Pawn');

moment.tz.setDefault(process.env.TIMEZONE);
moment.locale(process.env.LOCALE);

class Simulation {
  /**
   * @param {Character} character
   */
  constructor(character) {
    this.character = character;
    this.scaling = false;
    this.enemies = 1;
    this.report = {};
  }

  /**
   * Включение скалирования
   * @param {Boolean} isTrue
   */
  setScaling(isTrue = true) {
    this.scaling = isTrue === true;
  }

  /**
   * @param {Number} enemies
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }

  /**
   * @returns {string}
   */
  getReportName() {
    return `${this.character.name}-${this.character.realm.replace(/\s+/g, '-')}-${this.character.origin}`.toLowerCase();
  }

  /**
   * Сообщение о старте симуляции.
   * @param {Object} author
   * @returns {Object}
   */
  getStartMessage(author) {
    const richEmbed = new Discord.RichEmbed();
    richEmbed.setColor(15265561);
    richEmbed.setAuthor(author.tag, author.avatarURL);
    richEmbed.setDescription(`Начинаю симуляцию для персонажа **${this.character.getFullName()}**`);
    richEmbed.setThumbnail(this.character.getThumbnailUrl());
    richEmbed.addField('Количество целей:', this.enemies, true);
    richEmbed.addField('Текущая специализация:', this.character.getCurrentSpec(), true);
    richEmbed.addField('Последнее обновление персонажа:', moment(this.character.getLastModified()).format('DD MMM YYYY г., HH:mm:ss Z'), true);
    richEmbed.setFooter('Симуляция займёт какое-то время...');

    return { embed: richEmbed };
  }

  /**
   * Сообщение об окончании симуляции.
   * @param {Object} author
   * @returns {Object}
   */
  getEndMessage(author) {
    const richEmbed = new Discord.RichEmbed();
    richEmbed.setColor(1552707);
    richEmbed.setAuthor(author.tag, author.avatarURL);
    richEmbed.setDescription(`Симуляция для персонажа **${this.character.getFullName()}** завершена`);
    richEmbed.setThumbnail(this.character.getThumbnailUrl());
    richEmbed.addField('DPS:', numeral(this.report.sim.players[0].collected_data.dps.mean).format('0.00a'), true);
    if (this.enemies > 1) {
      richEmbed.addField('DPS (в основную цель):', numeral(this.report.sim.players[0].collected_data.prioritydps.mean).format('0.00a'), true);
    }
    if (this.scaling) {
      let primaryStatName;
      let primaryStatValue;

      if (this.report.sim.players[0].scale_factors.Int) {
        primaryStatName = 'Intellect';
        primaryStatValue = this.report.sim.players[0].scale_factors.Int;
      } else if (this.report.sim.players[0].scale_factors.Str) {
        primaryStatName = 'Strength';
        primaryStatValue = this.report.sim.players[0].scale_factors.Str;
      } else if (this.report.sim.players[0].scale_factors.Agi) {
        primaryStatName = 'Agility';
        primaryStatValue = this.report.sim.players[0].scale_factors.Agi;
      }

      richEmbed.addField('Вес статов:', `\`\`\`${pawn({
        name: ucfirst(this.character.name),
        class: this.report.sim.players[0].specialization.match(/\s+(.+)/)[1],
        spec: this.report.sim.players[0].specialization.split(' ')[0],
        crit: this.report.sim.players[0].scale_factors.Crit,
        haste: this.report.sim.players[0].scale_factors.Haste,
        mastery: this.report.sim.players[0].scale_factors.Mastery,
        versatility: this.report.sim.players[0].scale_factors.Vers,
        primaryStatName,
        primaryStatValue,
      }).toString()}\`\`\``);
    }
    richEmbed.addField('Подробнее:', `${process.env.REPORTS_BASE}/${this.getReportName()}.html`);

    return { embed: richEmbed };
  }

  /**
   * Запуск симуляции.
   * @returns {Promise}
   */
  async simulate() {
    const simcraft = new Simcarft(this.character.name, this.character.realm, this.character.origin);
    simcraft.setScaling(this.scaling);
    simcraft.setEnemies(this.enemies);
    simcraft.setReport(this.getReportName());
    this.report = await simcraft.simulate();
  }
}

module.exports = Simulation;
