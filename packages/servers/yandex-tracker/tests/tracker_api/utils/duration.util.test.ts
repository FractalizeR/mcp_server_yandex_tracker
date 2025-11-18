import { describe, it, expect } from 'vitest';
import { DurationUtil } from '@tracker_api/utils/duration.util.js';

describe('DurationUtil', () => {
  describe('parseHumanReadable', () => {
    describe('valid formats', () => {
      it('должна парсить часы (h)', () => {
        expect(DurationUtil.parseHumanReadable('1h')).toBe('PT1H');
        expect(DurationUtil.parseHumanReadable('2h')).toBe('PT2H');
        expect(DurationUtil.parseHumanReadable('24h')).toBe('PT24H');
      });

      it('должна парсить минуты (m)', () => {
        expect(DurationUtil.parseHumanReadable('30m')).toBe('PT30M');
        expect(DurationUtil.parseHumanReadable('15m')).toBe('PT15M');
        expect(DurationUtil.parseHumanReadable('59m')).toBe('PT59M');
      });

      it('должна парсить секунды (s)', () => {
        expect(DurationUtil.parseHumanReadable('30s')).toBe('PT30S');
        expect(DurationUtil.parseHumanReadable('45s')).toBe('PT45S');
        expect(DurationUtil.parseHumanReadable('59s')).toBe('PT59S');
      });

      it('должна парсить часы и минуты', () => {
        expect(DurationUtil.parseHumanReadable('1h 30m')).toBe('PT1H30M');
        expect(DurationUtil.parseHumanReadable('2h 15m')).toBe('PT2H15M');
        expect(DurationUtil.parseHumanReadable('12h 45m')).toBe('PT12H45M');
      });

      it('должна парсить часы, минуты и секунды', () => {
        expect(DurationUtil.parseHumanReadable('1h 30m 45s')).toBe('PT1H30M45S');
        expect(DurationUtil.parseHumanReadable('2h 15m 30s')).toBe('PT2H15M30S');
      });

      it('должна парсить минуты и секунды', () => {
        expect(DurationUtil.parseHumanReadable('30m 45s')).toBe('PT30M45S');
        expect(DurationUtil.parseHumanReadable('15m 30s')).toBe('PT15M30S');
      });

      it('должна парсить полные слова (hour, hours)', () => {
        expect(DurationUtil.parseHumanReadable('1 hour')).toBe('PT1H');
        expect(DurationUtil.parseHumanReadable('2 hours')).toBe('PT2H');
        expect(DurationUtil.parseHumanReadable('2 hours 30 minutes')).toBe('PT2H30M');
      });

      it('должна парсить сокращения (hr, hrs, min, mins)', () => {
        expect(DurationUtil.parseHumanReadable('1hr')).toBe('PT1H');
        expect(DurationUtil.parseHumanReadable('2hrs')).toBe('PT2H');
        expect(DurationUtil.parseHumanReadable('30min')).toBe('PT30M');
        expect(DurationUtil.parseHumanReadable('45mins')).toBe('PT45M');
        expect(DurationUtil.parseHumanReadable('1hr 30min')).toBe('PT1H30M');
      });

      it('должна игнорировать лишние пробелы', () => {
        expect(DurationUtil.parseHumanReadable('  1h  ')).toBe('PT1H');
        expect(DurationUtil.parseHumanReadable('1h   30m')).toBe('PT1H30M');
        expect(DurationUtil.parseHumanReadable('  2 hours  15 minutes  ')).toBe('PT2H15M');
      });

      it('должна быть регистронезависимой', () => {
        expect(DurationUtil.parseHumanReadable('1H')).toBe('PT1H');
        expect(DurationUtil.parseHumanReadable('30M')).toBe('PT30M');
        expect(DurationUtil.parseHumanReadable('1H 30M')).toBe('PT1H30M');
        expect(DurationUtil.parseHumanReadable('2 HOURS')).toBe('PT2H');
      });
    });

    describe('validation', () => {
      it('должна выбросить ошибку для пустой строки', () => {
        expect(() => DurationUtil.parseHumanReadable('')).toThrow(
          'Duration must be a non-empty string'
        );
        expect(() => DurationUtil.parseHumanReadable('   ')).toThrow(
          'Duration must be a non-empty string'
        );
      });

      it('должна выбросить ошибку для невалидного типа', () => {
        // @ts-expect-error Testing invalid input
        expect(() => DurationUtil.parseHumanReadable(null)).toThrow(
          'Duration must be a non-empty string'
        );
        // @ts-expect-error Testing invalid input
        expect(() => DurationUtil.parseHumanReadable(undefined)).toThrow(
          'Duration must be a non-empty string'
        );
        // @ts-expect-error Testing invalid input
        expect(() => DurationUtil.parseHumanReadable(123)).toThrow(
          'Duration must be a non-empty string'
        );
      });

      it('должна выбросить ошибку для нулевого времени', () => {
        expect(() => DurationUtil.parseHumanReadable('0h')).toThrow('Invalid duration format');
        expect(() => DurationUtil.parseHumanReadable('0m')).toThrow('Invalid duration format');
        expect(() => DurationUtil.parseHumanReadable('0h 0m')).toThrow('Invalid duration format');
      });

      it('должна выбросить ошибку для некорректного формата', () => {
        expect(() => DurationUtil.parseHumanReadable('invalid')).toThrow('Invalid duration format');
        expect(() => DurationUtil.parseHumanReadable('abc123')).toThrow('Invalid duration format');
        expect(() => DurationUtil.parseHumanReadable('PT1H')).toThrow('Invalid duration format');
      });

      it('должна выбросить ошибку для отрицательных значений', () => {
        expect(() => DurationUtil.parseHumanReadable('-1h')).toThrow(
          'Duration components must be non-negative'
        );
        expect(() => DurationUtil.parseHumanReadable('-30m')).toThrow(
          'Duration components must be non-negative'
        );
      });

      it('должна выбросить ошибку для минут >= 60', () => {
        expect(() => DurationUtil.parseHumanReadable('60m')).toThrow(
          'Minutes must be less than 60'
        );
        expect(() => DurationUtil.parseHumanReadable('1h 60m')).toThrow(
          'Minutes must be less than 60'
        );
      });

      it('должна выбросить ошибку для секунд >= 60', () => {
        expect(() => DurationUtil.parseHumanReadable('60s')).toThrow(
          'Seconds must be less than 60'
        );
        expect(() => DurationUtil.parseHumanReadable('1h 30m 60s')).toThrow(
          'Seconds must be less than 60'
        );
      });
    });
  });

  describe('toHumanReadable', () => {
    describe('valid formats', () => {
      it('должна конвертировать только часы', () => {
        expect(DurationUtil.toHumanReadable('PT1H')).toBe('1h');
        expect(DurationUtil.toHumanReadable('PT2H')).toBe('2h');
        expect(DurationUtil.toHumanReadable('PT24H')).toBe('24h');
      });

      it('должна конвертировать только минуты', () => {
        expect(DurationUtil.toHumanReadable('PT30M')).toBe('30m');
        expect(DurationUtil.toHumanReadable('PT15M')).toBe('15m');
        expect(DurationUtil.toHumanReadable('PT59M')).toBe('59m');
      });

      it('должна конвертировать только секунды', () => {
        expect(DurationUtil.toHumanReadable('PT30S')).toBe('30s');
        expect(DurationUtil.toHumanReadable('PT45S')).toBe('45s');
      });

      it('должна конвертировать часы и минуты', () => {
        expect(DurationUtil.toHumanReadable('PT1H30M')).toBe('1h 30m');
        expect(DurationUtil.toHumanReadable('PT2H15M')).toBe('2h 15m');
        expect(DurationUtil.toHumanReadable('PT12H45M')).toBe('12h 45m');
      });

      it('должна конвертировать часы, минуты и секунды', () => {
        expect(DurationUtil.toHumanReadable('PT1H30M45S')).toBe('1h 30m 45s');
        expect(DurationUtil.toHumanReadable('PT2H15M30S')).toBe('2h 15m 30s');
      });

      it('должна конвертировать минуты и секунды', () => {
        expect(DurationUtil.toHumanReadable('PT30M45S')).toBe('30m 45s');
        expect(DurationUtil.toHumanReadable('PT15M30S')).toBe('15m 30s');
      });

      it('должна игнорировать лишние пробелы', () => {
        expect(DurationUtil.toHumanReadable('  PT1H  ')).toBe('1h');
        expect(DurationUtil.toHumanReadable('  PT1H30M  ')).toBe('1h 30m');
      });
    });

    describe('validation', () => {
      it('должна выбросить ошибку для пустой строки', () => {
        expect(() => DurationUtil.toHumanReadable('')).toThrow(
          'ISO duration must be a non-empty string'
        );
        expect(() => DurationUtil.toHumanReadable('   ')).toThrow(
          'Invalid ISO 8601 Duration format'
        );
      });

      it('должна выбросить ошибку для невалидного типа', () => {
        // @ts-expect-error Testing invalid input
        expect(() => DurationUtil.toHumanReadable(null)).toThrow(
          'ISO duration must be a non-empty string'
        );
        // @ts-expect-error Testing invalid input
        expect(() => DurationUtil.toHumanReadable(undefined)).toThrow(
          'ISO duration must be a non-empty string'
        );
      });

      it('должна выбросить ошибку для нулевого времени', () => {
        expect(() => DurationUtil.toHumanReadable('PT0H')).toThrow('has zero duration');
        expect(() => DurationUtil.toHumanReadable('PT0M')).toThrow('has zero duration');
        expect(() => DurationUtil.toHumanReadable('PT0H0M')).toThrow('has zero duration');
      });

      it('должна выбросить ошибку для некорректного формата', () => {
        expect(() => DurationUtil.toHumanReadable('invalid')).toThrow(
          'Invalid ISO 8601 Duration format'
        );
        expect(() => DurationUtil.toHumanReadable('1h 30m')).toThrow(
          'Invalid ISO 8601 Duration format'
        );
        expect(() => DurationUtil.toHumanReadable('P1D')).toThrow(
          'Invalid ISO 8601 Duration format'
        );
      });
    });
  });

  describe('isValidIsoDuration', () => {
    it('должна вернуть true для валидных форматов', () => {
      expect(DurationUtil.isValidIsoDuration('PT1H')).toBe(true);
      expect(DurationUtil.isValidIsoDuration('PT30M')).toBe(true);
      expect(DurationUtil.isValidIsoDuration('PT1H30M')).toBe(true);
      expect(DurationUtil.isValidIsoDuration('PT1H30M45S')).toBe(true);
      expect(DurationUtil.isValidIsoDuration('PT45S')).toBe(true);
    });

    it('должна вернуть false для невалидных форматов', () => {
      expect(DurationUtil.isValidIsoDuration('')).toBe(false);
      expect(DurationUtil.isValidIsoDuration('1h 30m')).toBe(false);
      expect(DurationUtil.isValidIsoDuration('invalid')).toBe(false);
      expect(DurationUtil.isValidIsoDuration('PT0H')).toBe(false);
      expect(DurationUtil.isValidIsoDuration('PT0M')).toBe(false);
      expect(DurationUtil.isValidIsoDuration('P1D')).toBe(false);
    });

    it('должна вернуть false для невалидных типов', () => {
      // @ts-expect-error Testing invalid input
      expect(DurationUtil.isValidIsoDuration(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(DurationUtil.isValidIsoDuration(undefined)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(DurationUtil.isValidIsoDuration(123)).toBe(false);
    });
  });

  describe('toTotalMinutes', () => {
    it('должна конвертировать часы в минуты', () => {
      expect(DurationUtil.toTotalMinutes('PT1H')).toBe(60);
      expect(DurationUtil.toTotalMinutes('PT2H')).toBe(120);
      expect(DurationUtil.toTotalMinutes('PT24H')).toBe(1440);
    });

    it('должна возвращать минуты как есть', () => {
      expect(DurationUtil.toTotalMinutes('PT30M')).toBe(30);
      expect(DurationUtil.toTotalMinutes('PT15M')).toBe(15);
      expect(DurationUtil.toTotalMinutes('PT45M')).toBe(45);
    });

    it('должна конвертировать часы и минуты', () => {
      expect(DurationUtil.toTotalMinutes('PT1H30M')).toBe(90);
      expect(DurationUtil.toTotalMinutes('PT2H15M')).toBe(135);
      expect(DurationUtil.toTotalMinutes('PT12H45M')).toBe(765);
    });

    it('должна округлять секунды вверх до полной минуты', () => {
      expect(DurationUtil.toTotalMinutes('PT30S')).toBe(1); // 30 секунд = 1 минута
      expect(DurationUtil.toTotalMinutes('PT1M30S')).toBe(2); // 1.5 минуты = 2 минуты
      expect(DurationUtil.toTotalMinutes('PT1H30M45S')).toBe(91); // 90.75 минут = 91 минута
    });

    it('должна выбросить ошибку для невалидного формата', () => {
      expect(() => DurationUtil.toTotalMinutes('invalid')).toThrow('Invalid ISO 8601 Duration');
      expect(() => DurationUtil.toTotalMinutes('1h 30m')).toThrow('Invalid ISO 8601 Duration');
      expect(() => DurationUtil.toTotalMinutes('PT0H')).toThrow('Invalid ISO 8601 Duration');
    });
  });

  describe('round-trip conversion', () => {
    it('должна корректно конвертировать туда и обратно', () => {
      const cases = ['1h', '30m', '1h 30m', '2h 15m', '45m', '2h'];

      for (const input of cases) {
        const iso = DurationUtil.parseHumanReadable(input);
        const human = DurationUtil.toHumanReadable(iso);
        const isoAgain = DurationUtil.parseHumanReadable(human);

        expect(isoAgain).toBe(iso);
      }
    });

    it('должна корректно конвертировать ISO туда и обратно', () => {
      const cases = ['PT1H', 'PT30M', 'PT1H30M', 'PT2H15M', 'PT45M'];

      for (const input of cases) {
        const human = DurationUtil.toHumanReadable(input);
        const iso = DurationUtil.parseHumanReadable(human);

        expect(iso).toBe(input);
      }
    });
  });
});
