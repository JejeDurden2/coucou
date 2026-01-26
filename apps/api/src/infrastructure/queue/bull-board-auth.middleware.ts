import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to maintain constant time regardless of length mismatch
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function bullBoardAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const username = process.env.BULL_BOARD_USERNAME;
  const password = process.env.BULL_BOARD_PASSWORD;

  if (!username || !password) {
    res.status(403).send('Bull Board credentials not configured');
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
    res.status(401).send('Authentication required');
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [providedUsername, providedPassword] = credentials.split(':');

  if (
    safeCompare(providedUsername ?? '', username) &&
    safeCompare(providedPassword ?? '', password)
  ) {
    next();
    return;
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
  res.status(401).send('Invalid credentials');
}
