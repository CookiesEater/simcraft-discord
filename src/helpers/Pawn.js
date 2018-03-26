/**
 * Формирует строку для аддона Pawn.
 */
class Pawn {
  /**
   * Конструктов.
   * @param params
   */
  constructor(params) {
    this.name = params.name;
    this.class = params.class.replace(/\s+/, '');
    this.spec = params.spec;
    this.primaryStatName = params.primaryStatName;
    this.primaryStatValue = parseFloat(params.primaryStatValue).toFixed(2);
    this.crit = parseFloat(params.crit).toFixed(2);
    this.haste = parseFloat(params.haste).toFixed(2);
    this.mastery = parseFloat(params.mastery).toFixed(2);
    this.versatility = parseFloat(params.versatility).toFixed(2);
  }

  /**
   * Возвращает строку для Pawn.
   * @returns {string}
   */
  toString() {
    return `( Pawn: v1: "${this.name}": Class=${this.class}, Spec=${this.spec}, ${this.primaryStatName}=${this.primaryStatValue}, CritRating=${this.crit}, HasteRating=${this.haste}, MasteryRating=${this.mastery}, Versatility=${this.versatility} )`;
  }
}

module.exports = params => new Pawn(params);
