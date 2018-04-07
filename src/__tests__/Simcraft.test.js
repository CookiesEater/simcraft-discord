const os = require('os');
const { spawn } = require('child_process');
const Simcraft = require('./../components/Simcraft');

jest.mock('child_process');
jest.mock('fs');

describe('Simcraft', () => {
  beforeEach(() => {
    process.env.BATTLE_NET_KEY = '123';
  });

  it('has working simulate', async () => {
    const simcraft = new Simcraft('test', 'long realm', 'origin');
    const report = simcraft.simulate();

    expect(spawn).toHaveBeenCalledWith('docker', [
      'run',
      '-e', 'apiKey=123',
      '-v', 'simcraft-data:/simcraft-data',
      '-v', 'simcraft-reports:/simcraft-reports',
      '--rm',
      'cookieseater/simcraft:latest',
      'armory=origin,long realm,test',
      'json2=/simcraft-data/report.json',
      'report_details=0',
      'use_item_verification=0',
      'fight_style=Patchwerk',
      'max_time=300',
      `threads=${os.cpus().length}`,
      'iterations=5000',
      'enemy=Fluffy_Pillow',
    ]);

    simcraft.setEnemies(6);
    simcraft.setScaling();
    simcraft.setReport('report');
    simcraft.simulate();

    expect(spawn).toHaveBeenCalledWith('docker', [
      'run',
      '-e', 'apiKey=123',
      '-v', 'simcraft-data:/simcraft-data',
      '-v', 'simcraft-reports:/simcraft-reports',
      '--rm',
      'cookieseater/simcraft:latest',
      'armory=origin,long realm,test',
      'json2=/simcraft-data/report.json',
      'report_details=0',
      'use_item_verification=0',
      'fight_style=Patchwerk',
      'max_time=300',
      `threads=${os.cpus().length}`,
      'iterations=10000',
      'html=/simcraft-reports/report.html',
      'calculate_scale_factors=1',
      'scale_only=agility,strength,intellect,crit_rating,haste_rating,mastery_rating,versatility_rating',
      'normalize_scale_factors=1',
      'enemy=Fluffy_Pillow',
      'enemy=Fluffy_Pillow',
      'enemy=Fluffy_Pillow',
      'enemy=Fluffy_Pillow',
      'enemy=Fluffy_Pillow',
      'enemy=Fluffy_Pillow',
    ]);
    expect(report).toBeDefined();
  });

  it('has working info', async () => {
    const simcraft = new Simcraft('test', 'long realm', 'origin');
    const info = await simcraft.info();

    expect(spawn).toHaveBeenCalledWith('docker', [
      'run',
      '-e', 'apiKey=123',
      '-v', 'simcraft-data:/simcraft-data',
      '-v', 'simcraft-reports:/simcraft-reports',
      '--rm',
      'cookieseater/simcraft:latest',
    ]);
    expect(info).toBe('Unknown version');
  });
});
