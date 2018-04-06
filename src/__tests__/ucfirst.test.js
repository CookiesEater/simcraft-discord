const ucfirst = require('./../helpers/ucfirst');

describe('ucfirst', () => {
  it('work', () => {
    expect(ucfirst('test')).toBe('Test');
    expect(ucfirst('multi words test')).toBe('Multi words test');
    expect(ucfirst('multi\nline\ntest')).toBe('Multi\nline\ntest');
  });
});
