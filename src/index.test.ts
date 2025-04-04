import { incrementVersion } from './index';

describe('incrementVersion', () => {
  it('should increment major version', () => {
    expect(incrementVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  it('should increment minor version', () => {
    expect(incrementVersion('1.2.3', 'minor')).toBe('1.3.0');
  });

  it('should increment patch version', () => {
    expect(incrementVersion('1.2.3', 'patch')).toBe('1.2.4');
  });
});

describe('commit parsing', () => {
  it('should parse feature commit', () => {
    const message = 'feat: add new feature';
    const match = message.match(/^(feat|fix|chore|docs|refactor|perf|test)(?:\(([^)]+)\))?: (.+)/);
    expect(match).not.toBeNull();
    if (match) {
      const [, type, scope, subject] = match;
      expect(type).toBe('feat');
      expect(subject).toBe('add new feature');
    }
  });

  it('should parse breaking change commit', () => {
    const message = 'feat!: breaking change\n\nBREAKING CHANGE: This is a breaking change';
    const match = message.match(/^(feat|fix|chore|docs|refactor|perf|test)(?:\(([^)]+)\))?: (.+)/);
    expect(match).not.toBeNull();
    if (match) {
      const [, type, scope, subject] = match;
      expect(type).toBe('feat');
      expect(message.includes('BREAKING CHANGE:')).toBe(true);
    }
  });

  it('should parse scoped commit', () => {
    const message = 'feat(api): add new endpoint';
    const match = message.match(/^(feat|fix|chore|docs|refactor|perf|test)(?:\(([^)]+)\))?: (.+)/);
    expect(match).not.toBeNull();
    if (match) {
      const [, type, scope, subject] = match;
      expect(type).toBe('feat');
      expect(scope).toBe('api');
      expect(subject).toBe('add new endpoint');
    }
  });
}); 