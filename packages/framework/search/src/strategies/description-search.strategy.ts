/**
 * Стратегия full-text поиска по описанию
 *
 * Алгоритм:
 * - Токенизация query и description
 * - Подсчёт совпадающих токенов
 * - Score = (matched tokens) / (total query tokens) * weight
 *
 * Responsibilities:
 * - Полнотекстовый поиск по описанию
 * - Токенизация текста
 * - Оценка релевантности по количеству совпадений
 */

import type { ISearchStrategy } from './search-strategy.interface.js';
import type { SearchResult, StaticToolIndex } from '../types.js';
import { tokenize } from '../utils/text-utils.js';

/**
 * Стратегия поиска по описанию
 */
export class DescriptionSearchStrategy implements ISearchStrategy {
  /**
   * Минимальная длина токена для поиска
   *
   * Игнорируем короткие слова (предлоги, союзы и т.д.)
   */
  private readonly MIN_TOKEN_LENGTH = 2;

  /**
   * Вес для description search
   *
   * Пониженный, т.к. description может содержать много noise
   */
  private readonly DESCRIPTION_WEIGHT = 0.7;

  search(query: string, tools: StaticToolIndex[]): SearchResult[] {
    const queryTokens = tokenize(query, {
      normalizeSeparators: false,
      minLength: this.MIN_TOKEN_LENGTH,
    });

    if (queryTokens.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const tool of tools) {
      const matches = this.findMatches(queryTokens, tool.descriptionTokens);

      if (matches.length > 0) {
        const score = (matches.length / queryTokens.length) * this.DESCRIPTION_WEIGHT;

        results.push({
          toolName: tool.name,
          score,
          matchReason: `Matched ${matches.length}/${queryTokens.length} tokens in description`,
          strategyType: 'description',
        });
      }
    }

    return results;
  }

  /**
   * Найти совпадающие токены
   */
  private findMatches(queryTokens: string[], descTokens: string[]): string[] {
    const matches: string[] = [];

    for (const queryToken of queryTokens) {
      const found = descTokens.some(
        (descToken) => descToken.includes(queryToken) || queryToken.includes(descToken)
      );

      if (found) {
        matches.push(queryToken);
      }
    }

    return matches;
  }

}
