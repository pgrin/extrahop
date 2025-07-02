export const isPotentialXSS = (obj: any) => {
  // XSS pattern
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  if (typeof obj === "string") {
    return xssPattern.test(obj);
  }

  for (let key in obj) {
    if (typeof obj[key] === "string" && xssPattern.test(obj[key])) return true;
    if (typeof obj[key] === "object" && isPotentialXSS(obj[key])) return true;
  }
  return false;
};
