import { User } from './user.model';

// Backend wraps everything in { data: ... }
// Token response uses exact keys: access_Token / refreash_Token
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  // backend sometimes returns error details here
  extra?: { errors?: Array<{ details?: Array<{ message: string }> }> };
}

export interface TokenData {
  access_Token: string;
  refreash_Token: string;   // backend typo kept exactly
}

export interface AuthResponse {
  data? : any
  user: User;
  access_Token: string;
  refreash_Token: string;
}

// login may return a string OTP message instead of tokens
export type LoginResponse = AuthResponse | string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Extract first Joi validation error message from backend shape */
export function extractBackendError(err: unknown): string {
  try {
    const e = err as { error?: { errorMessage?: string; extra?: { errors?: Array<{ details?: Array<{ message: string }> }> } } };
    const details = e?.error?.extra?.errors?.[0]?.details?.[0]?.message;
    if (details) return details;
    return e?.error?.errorMessage ?? 'Something went wrong.';
  } catch {
    return 'Something went wrong.';
  }
}
