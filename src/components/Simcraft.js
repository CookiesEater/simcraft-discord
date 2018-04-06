const debug = require('debug');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

const error = debug('bot:error');
const log = debug('bot:log');
log.log = console.log.bind(console); // eslint-disable-line no-console

class Simcraft {
  /**
   * Конструктор.
   * @param {String} name
   * @param {String} realm
   * @param {String} origin
   */
  constructor(name, realm, origin) {
    this.dockerParams = [
      'run',
      '-e', `apiKey=${process.env.BATTLE_NET_KEY}`,
      '-v', 'simcraft-data:/simcraft-data',
      '-v', 'simcraft-reports:/simcraft-reports',
      '--rm',
      'cookieseater/simcraft:latest',
    ];
    this.defaultParams = {
      armory: `${origin},${realm},${name}`,
      json2: '/simcraft-data/report.json',
      report_details: 0,
      use_item_verification: 0, // Убрать ошибки если не прописано use_item для используемых предметов
      fight_style: 'Patchwerk',
      max_time: 300,
      threads: os.cpus().length,
      iterations: 5000,
    };
    this.scalingParams = {
      calculate_scale_factors: 1,
      scale_only: 'agility,strength,intellect,crit_rating,haste_rating,mastery_rating,versatility_rating',
      normalize_scale_factors: 1,
    };
    this.enemyParams = {
      enemy: 'Fluffy_Pillow',
    };

    this.scaling = false;
    this.enemies = 1;
  }

  /**
   * Установка имени для html отчёта.
   * @param {String} name
   */
  setReport(name) {
    this.defaultParams.html = `/simcraft-reports/${name}.html`;
  }

  /**
   * Установка скалирования.
   * @param {Boolean} isTrue
   */
  setScaling(isTrue = true) {
    if (isTrue) {
      this.defaultParams.iterations = 10000;
    } else {
      this.defaultParams.iterations = 5000;
    }

    this.scaling = isTrue === true;
  }

  /**
   * Установка количества врагов.
   * @param {Number} enemies
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }

  /**
   * Старт симуляции.
   * @returns {Promise}
   */
  simulate() {
    return new Promise((resolve, reject) => {
      const simcraft = spawn('docker', this.getProcessParams());

      // Если убрать подписку на stdout то процесс не завершится, в доках лень копаться
      simcraft.stdout.on('data', () => {});
      simcraft.stderr.on('data', (data) => {
        error('stderr during simulate: %s', data);
      });

      simcraft.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Exit with code ${code}`));
        }

        fs.readFile('/simcraft-data/report.json', 'utf8', (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(JSON.parse(data));
        });
      });
    });
  }

  /**
   * Возвращает информацию о симкрафте.
   * @returns {Promise}
   */
  info() {
    return new Promise((resolve) => {
      const simcraft = spawn('docker', this.dockerParams);
      let out = '';

      simcraft.stdout.on('data', (data) => {
        out += data;
      });
      simcraft.stderr.on('data', (data) => {
        out += data;
      });

      simcraft.on('close', () => {
        if (/SimulationCraft.*/.test(out)) {
          resolve(out.match(/SimulationCraft.*/)[0]);
        } else {
          resolve('Unknown version');
        }
      });
    });
  }

  /**
   * Возвращает массив параметров для запуска процесса симуляции.
   * @returns {Array}
   * @private
   */
  getProcessParams() {
    let params = this.dockerParams;

    params = params.concat(this.prepareObjectParams(this.defaultParams));
    if (this.scaling) {
      params = params.concat(this.prepareObjectParams(this.scalingParams));
    }
    for (let i = 0; i < this.enemies; i++) {
      params = params.concat(this.prepareObjectParams(this.enemyParams));
    }

    return params;
  }

  /**
   * Преобразует параметры из объектной вида в массив для spawn()
   * @param {Object} params
   * @returns {Array}
   * @private
   */
  prepareObjectParams(params) {
    let result = [];
    Object.keys(params).map((key) => {
      result.push(`${key}=${params[key]}`);
    });

    return result;
  }
}

module.exports = Simcraft;
