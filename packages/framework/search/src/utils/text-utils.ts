/**
 * Text processing utilities for search
 *
 * Shared utilities to avoid code duplication across search engine and strategies.
 */

/**
 * Tokenize text into search tokens
 *
 * @param text - Text to tokenize
 * @param options - Tokenization options
 * @returns Array of lowercase tokens
 *
 * @example
 * ```ts
 * tokenize('HelloWorld') // ['helloworld']
 * tokenize('hello-world_test') // ['hello', 'world', 'test']
 * tokenize('Hello World!', { minLength: 2 }) // ['hello', 'world']
 * ```
 */
export function tokenize(
  text: string,
  options?: {
    /**
     * Normalize separators (-, _) to spaces before tokenization
     * @default true
     */
    normalizeSeparators?: boolean;
    /**
     * Minimum token length (shorter tokens will be filtered out)
     * @default 0
     */
    minLength?: number;
  }
): string[] {
  const { normalizeSeparators = true, minLength = 0 } = options ?? {};

  let processed = text.toLowerCase();

  // Normalize separators if requested
  if (normalizeSeparators) {
    processed = processed.replace(/[_-]/g, ' ');
  }

  return processed
    .split(/\W+/)
    .filter((token) => token.length > minLength);
}

/**
 * Extract short description from text (first sentence)
 *
 * @param description - Full description text
 * @returns First sentence or full text if no sentence boundary found
 *
 * @example
 * ```ts
 * getShortDescription('First sentence. Second sentence.')
 * // 'First sentence'
 *
 * getShortDescription('No punctuation')
 * // 'No punctuation'
 * ```
 */
export function getShortDescription(description: string): string {
  const firstSentence = description.split(/[.!?]/)[0];
  return firstSentence ? firstSentence.trim() : description;
}
