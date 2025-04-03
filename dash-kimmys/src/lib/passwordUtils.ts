// lib/passwordUtils.ts
import crypto from 'crypto';

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
}

export function verifyPassword(
  inputPassword: string,
  storedHash: string,
  salt: string
): boolean {
  const inputHash = hashPassword(inputPassword, salt);
  return inputHash === storedHash;
}