import type { NextFunction, Request, Response } from 'express';

export function bullBoardAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const username = process.env.BULL_BOARD_USERNAME;
  const password = process.env.BULL_BOARD_PASSWORD;

  // If no credentials configured, allow access (dev mode)
  if (!username || !password) {
    next();
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

  if (providedUsername === username && providedPassword === password) {
    next();
    return;
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
  res.status(401).send('Invalid credentials');
}
