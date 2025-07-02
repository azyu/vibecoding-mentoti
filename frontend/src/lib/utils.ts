import CryptoJS from 'crypto-js';

export function getGravatarUrl(email: string, size: number = 200): string {
  if (!email) {
    return `https://www.gravatar.com/avatar/?s=${size}&d=mp`; // 'mp' for mystery person
  }
  const hash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}
