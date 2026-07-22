import type { CompareSession, CompareSessionProvider, SessionStatus } from '../types';

const SESSION_STORAGE_KEY = 'ai-consensus-checker-compare-session';
const SESSION_VERSION = 1;
const SESSION_TTL_MINUTES = 30;

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isSessionStatus(value: unknown): value is SessionStatus {
  return value === 'success' || value === 'error';
}

function isValidProviderEntry(value: unknown): value is CompareSessionProvider {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;

  return (
    typeof entry.providerId === 'string' && entry.providerId.length > 0 &&
    typeof entry.providerName === 'string' && entry.providerName.length > 0 &&
    typeof entry.modelName === 'string' && entry.modelName.length > 0 &&
    isSessionStatus(entry.status) &&
    typeof entry.responseTime === 'number' && entry.responseTime >= 0 &&
    typeof entry.answer === 'string' &&
    isIsoDateString(entry.timestamp)
  );
}

function validateCompareSession(value: unknown): CompareSession | null {
  if (typeof value !== 'object' || value === null) return null;
  const session = value as Record<string, unknown>;

  if (session.version !== SESSION_VERSION) return null;
  if (typeof session.question !== 'string' || session.question.trim().length === 0) return null;
  if (!isIsoDateString(session.createdAt) || !isIsoDateString(session.expiresAt)) return null;
  if (!Array.isArray(session.providers) || session.providers.length === 0) return null;
  if (!session.providers.every(isValidProviderEntry)) return null;

  return {
    version: SESSION_VERSION,
    question: session.question,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    providers: session.providers as CompareSessionProvider[],
  };
}

export function createCompareSession(question: string, providers: CompareSessionProvider[]): CompareSession {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000).toISOString();

  return {
    version: SESSION_VERSION,
    question,
    createdAt,
    expiresAt,
    providers,
  };
}

export function saveCompareSession(session: CompareSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadCompareSession(): CompareSession | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return validateCompareSession(parsed);
  } catch {
    clearCompareSession();
    return null;
  }
}

export function parseCompareSession(value: unknown): CompareSession | null {
  return validateCompareSession(value);
}

export function recoverCompareSession(): CompareSession | null {
  const session = loadCompareSession();
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    clearCompareSession();
    return null;
  }

  return session;
}

export function clearCompareSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function hasCompareSession(): boolean {
  return recoverCompareSession() !== null;
}
