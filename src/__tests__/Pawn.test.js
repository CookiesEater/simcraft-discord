const pawn = require('./../helpers/Pawn');

describe('pawn', () => {
  it('correct params', () => {
    const p = pawn({
      name: 'test',
      class: 'Death Knight',
      spec: 'Healer',
      primaryStatName: 'Strength',
      primaryStatValue: 9.453,
      crit: '16.87',
      haste: '5.4',
      mastery: 9.8475,
      versatility: 10,
    });
    expect(p.toString()).toBe('( Pawn: v1: "test": Class=DeathKnight, Spec=Healer, Strength=9.45, CritRating=16.87, HasteRating=5.40, MasteryRating=9.85, Versatility=10.00 )');
  });
});
