const onMessage = require('./../onMessage');

jest.mock('blizzard.js');

const client = { user: 123 };
process.env.DEFAULT_REALM = 'default realm';
process.env.DEFAULT_ORIGIN = 'default origin';

describe('onMessage', () => {
  let createMessage;
  beforeEach(() => {
    createMessage = props => ({
      author: {
        bot: false,
      },
      channel: {
        send: jest.fn(),
      },
      reply: jest.fn(),
      isMentioned() {
        return true;
      },
      guild: {
        id: 12345,
        name: 'Test Server',
      },
      content: '',
      embeds: [],
      ...props,
    });
  });

  it('do not respond if it is not mentioned message', async () => {
    const message = createMessage({
      isMentioned() {
        return false;
      },
    });
    await onMessage(client, message);
    expect(message.reply).not.toHaveBeenCalled();
  });

  it('do not respond if there is no name in the message', async () => {
    const message = createMessage({
      content: 'Hi <@123>',
    });
    await onMessage(client, message);
    expect(message.reply).not.toHaveBeenCalled();
  });

  it('respond error if character not found', async () => {
    const message = createMessage({
      content: 'notfound',
    });
    await onMessage(client, message);
    expect(message.reply).toHaveBeenCalledWith('Blizzard говорит что персонажа Notfound-Default realm-default origin нет. Где-то ошибка в имени?');
  });

  it('respond error if character in healer spec', async () => {
    const message = createMessage({
      content: 'healer-test-eu',
    });
    await onMessage(client, message);
    expect(message.reply).toHaveBeenCalledWith('Персонаж Healer-Test-eu находится в специализации лекаря. SimulationCraft не умеет считать HPS.');
  });
});
