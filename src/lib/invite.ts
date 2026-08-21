const INVITE_CODE = /^[A-F0-9]{10}$/;
const PENDING_INVITE_KEY = 'kinboard:pending-invite:v1';

export function normalizeInviteCode(value: string | null): string {
  const code = value?.trim().toUpperCase() ?? '';
  return INVITE_CODE.test(code) ? code : '';
}

export function invitePath(code: string): string {
  return `/join?code=${encodeURIComponent(code)}`;
}

export function inviteUrl(code: string): string {
  return new URL(invitePath(code), window.location.origin).toString();
}

export function rememberPendingInvite(code: string): void {
  if (normalizeInviteCode(code)) localStorage.setItem(PENDING_INVITE_KEY, code);
}

export function readPendingInvite(): string {
  return normalizeInviteCode(localStorage.getItem(PENDING_INVITE_KEY));
}

export function clearPendingInvite(): void {
  localStorage.removeItem(PENDING_INVITE_KEY);
}
