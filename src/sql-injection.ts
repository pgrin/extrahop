export const isPotentialSQLi = (input: string): boolean => {
  const patterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Single quotes, --, #
    /(\bOR\b|\bAND\b).*(=|\bLIKE\b)/i, // OR/AND, =, LIKE
    /(\bUNION\b.*\bSELECT\b)/i, // UNION SELECT
    /(\bINSERT\b|\bDROP\b|\bDELETE\b|\bUPDATE\b)/i, // INSERT, DROP, DELETE, UPDATE
    /(\bWAITFOR\b|\bDELAY\b|\bSLEEP\b)/i, // WAITFOR, DELAY, SLEEP
  ];

  return patterns.some((pattern) => pattern.test(input));
};
