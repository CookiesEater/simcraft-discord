const Discord = require('discord.js');
const Character = require('./../components/Character');
const Simulation = require('./../components/Simulation');

jest.mock('child_process');
jest.mock('fs');

describe('Simulation', () => {
  const createCharacter = async () => {
    const character = new Character('name', 'long realm', 'origin');
    await character.load();
    return character;
  };
  const createAuthor = () => {
    return {
      tag: '#1234',
      avatarURL: 'https://some.url',
    };
  };

  it('has correct params', async () => {
    const character = await createCharacter();
    const simulation = new Simulation(character);

    expect(simulation.character).toBeInstanceOf(Character);
    expect(simulation.scaling).toBeFalsy();
    expect(simulation.enemies).toBe(1);
    expect(simulation.getReportName()).toBe('name-long-realm-origin');

    simulation.setScaling();
    simulation.setEnemies(4);

    expect(simulation.scaling).toBeTruthy();
    expect(simulation.enemies).toBe(4);
  });

  it('can simulate', async () => {
    const character = await createCharacter();
    const simulation = new Simulation(character);

    expect(simulation.report).toEqual({});
    await simulation.simulate();
    expect(simulation.report).toHaveProperty('sim');
  });

  it('has correct messages', async () => {
    const character = await createCharacter();
    const simulation = new Simulation(character);
    await simulation.simulate();

    const startMessage = simulation.getStartMessage(createAuthor());
    const endMessage = simulation.getEndMessage(createAuthor());

    expect(startMessage.embed).toBeInstanceOf(Discord.RichEmbed);
    expect(startMessage.embed.fields.length).toBe(3);

    expect(endMessage.embed).toBeInstanceOf(Discord.RichEmbed);
    expect(endMessage.embed.fields.length).toBe(2);
  });

  it('has pawn field', async () => {
    const character = await createCharacter();
    const simulation = new Simulation(character);
    simulation.setScaling();
    await simulation.simulate();

    const endMessage = simulation.getEndMessage(createAuthor());

    expect(endMessage.embed.fields.length).toBe(3);
  });

  it('has additional dps field', async () => {
    const character = await createCharacter();
    const simulation = new Simulation(character);
    simulation.setEnemies(2);
    await simulation.simulate();

    const endMessage = simulation.getEndMessage(createAuthor());

    expect(endMessage.embed.fields.length).toBe(3);
  });
});
