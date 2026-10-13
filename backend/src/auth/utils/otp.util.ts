
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashOtp(code: string, pepper: string): string {
  return createHmac('sha256', pepper).update(code).digest('hex');
}

export function verifyOtpHash(
  suppliedHash: string,
  storedHash: string,
): boolean {
  const supplied = Buffer.from(suppliedHash, 'hex');
  const stored = Buffer.from(storedHash, 'hex');

  return (
    supplied.length === stored.length &&
    supplied.length > 0 &&
    timingSafeEqual(supplied, stored)
  );
}
