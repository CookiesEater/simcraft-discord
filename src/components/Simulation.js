const Simcarft = require('./Simcraft');

class Simulation {
  constructor() {
    this.name = '';
    this.realm = '';
    this.origin = '';
    this.reportName = '';
    this.scaling = false;
    this.enemies = 1;
  }

  /**
   * @param {String} name
   */
  setName(name) {
    this.name = name;
  }

  /**
   * @param {String} realm
   */
  setRealm(realm) {
    this.realm = realm;
  }

  /**
   * @param {String} origin
   */
  setOrigin(origin) {
    this.origin = origin;
  }

  /**
   * @param {String} reportName
   */
  setReportName(reportName) {
    this.reportName = reportName;
  }

  /**
   * Включение скалирования
   */
  setScaling() {
    this.scaling = true;
  }

  /**
   * @param {Number} enemies
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }

  /**
   * Запуск симуляции.
   * @returns {Promise}
   */
  simulate() {
    return (new Simcarft(this)).simulate();
  }
}

module.export = Simulation;
