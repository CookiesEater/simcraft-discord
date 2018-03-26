const blizzard = require('blizzard.js').initialize({ apikey: process.env.BATTLE_NET_KEY }, {});
const ucfirst = require('./../helpers/ucfirst');

const SPEC_HEALING = 'HEALING';

class Character {
  /**
   * @param {String} name Имя персонажа
   * @param {String} realm Сервер
   * @param {String} origin Зона
   */
  constructor(name, realm, origin) {
    this.name = name;
    this.realm = realm;
    this.origin = origin;
  }

  /**
   * Полное название персонажа.
   * @returns {String}
   */
  getFullName() {
    return `${ucfirst(this.name)}-${ucfirst(this.realm)}-${this.origin}`;
  }

  /**
   * Возвращает название текущей специализации.
   * @returns {String}
   */
  getCurrentSpec() {
    return this.character.talents.find(spec => spec.selected).spec.name;
  }

  /**
   * Возвращает время последнего обновления.
   * @returns {String}
   */
  getLastModified() {
    return this.character.lastModified;
  }

  /**
   * Url до миниатюры.
   * @returns {String}
   */
  getThumbnailUrl() {
    return `https://render-${this.origin}.worldofwarcraft.com/character/${this.character.thumbnail}`;
  }

  /**
   * Это целитель.
   * @returns {Boolean}
   */
  isHealer() {
    return this.character.talents.find(spec => spec.selected).spec.role === SPEC_HEALING;
  }

  /**
   * Загрузка данных о персонаже.
   * @returns {Promise}
   */
  async load() {
    this.character = (await blizzard.wow.character(['talents'], {
      name: this.name,
      realm: this.realm,
      origin: this.origin,
      locale: process.env.LOCALE,
    })).data;
  }
}

module.exports = Character;
