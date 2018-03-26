// const blizzard = require('blizzard.js');
const Character = require('./../components/Character');

jest.mock('blizzard.js');

describe('Character', () => {
  it('correct full name', () => {
    const character = new Character('test', 'my server', 'origin');

    expect(character.getFullName()).toBe('Test-My server-origin');
  });

  it('loaded', async () => {
    const character = new Character('test', 'my server', 'origin');
    await character.load();
    expect(character.character).toBeDefined();
  });

  it('not loaded if not found', async () => {
    const character = new Character('notfound', 'my server', 'origin');
    try {
      await character.load();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('not loaded if not found', async () => {
    const character = new Character('notfound', 'my server', 'origin');
    try {
      await character.load();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('correct data', async () => {
    const character = new Character('test', 'my server', 'origin');
    await character.load();
    expect(character.isHealer()).toBeFalsy();
    expect(character.getCurrentSpec()).toBe('Тьма');
    expect(character.getLastModified()).toBe(1522019197000);
    expect(character.getThumbnailUrl()).toBe('https://render-origin.worldofwarcraft.com/character/galakrond/159/58021023-avatar.jpg');
  });

  it('correct current healer specialization', async () => {
    const character = new Character('healer', 'my server', 'origin');
    await character.load();
    expect(character.isHealer()).toBeTruthy();
    expect(character.getCurrentSpec()).toBe('Свет');
  });
});
