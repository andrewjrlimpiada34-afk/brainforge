import type { User } from 'firebase/auth';

async function createAuthenticatedHeaders(user: User) {
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function authenticatedFetch<T>(
  user: User,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const headers = await createAuthenticatedHeaders(user);
  const response = await fetch(input, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.');
  }

  return data as T;
}
