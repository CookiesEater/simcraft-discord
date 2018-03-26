const Command = require('./../components/Command');

describe('Command', () => {
  it('correct prepare message', () => {
    const command = new Command('!test <@1234567889>. Hi, <@92736721123>! test me');

    expect(command.command).toBe('test me');
  });

  it('correct info flag', () => {
    const command = new Command('Hi!!! <@1234567889> инфо');
    expect(command.info).toBeTruthy();
  });

  it('correct parse message', () => {
    process.env.DEFAULT_REALM = 'default realm';
    process.env.DEFAULT_ORIGIN = 'default origin';

    let command = new Command('Привет <@1234567889> Хардис pawn 2 цели.');
    expect(command.name).toBe('хардис');
    expect(command.realm).toBe('default realm');
    expect(command.origin).toBe('default origin');
    expect(command.pawn).toBeTruthy();
    expect(command.enemies).toBe(2);
    expect(command.info).toBeFalsy();

    command = new Command('<@1234567889> Хардис-Ясеневый лес');
    expect(command.name).toBe('хардис');
    expect(command.realm).toBe('ясеневый лес');
    expect(command.origin).toBe('default origin');
    expect(command.pawn).toBeFalsy();
    expect(command.enemies).toBe(1);
    expect(command.info).toBeFalsy();

    command = new Command('<@1234567889> pawn Хардис-Ясеневый лес-eu 5 целей');
    expect(command.name).toBe('хардис');
    expect(command.realm).toBe('ясеневый лес');
    expect(command.origin).toBe('eu');
    expect(command.pawn).toBeTruthy();
    expect(command.enemies).toBe(5);
    expect(command.info).toBeFalsy();
  });
});
