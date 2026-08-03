export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function toCanonicalEmail(email: string): string {
  const normalized = normalizeEmailAddress(email);
  const atIndex = normalized.indexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return normalized;
  }

  const localPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex + 1);
  const plusIndex = localPart.indexOf("+");
  const canonicalLocalPart = plusIndex === -1 ? localPart : localPart.slice(0, plusIndex);

  return `${canonicalLocalPart}@${domainPart}`;
}

export function maskEmailAddress(email: string): string {
  const normalized = normalizeEmailAddress(email);
  const atIndex = normalized.indexOf("@");

  if (atIndex <= 1 || atIndex === normalized.length - 1) {
    return "***";
  }

  const localPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex + 1);
  const visiblePrefix = localPart.slice(0, Math.min(3, localPart.length));

  return `${visiblePrefix}***@${domainPart}`;
}
