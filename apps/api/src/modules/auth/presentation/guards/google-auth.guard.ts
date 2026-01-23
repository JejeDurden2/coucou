import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const termsAccepted = request.query.termsAccepted === 'true';

    // Encode state as base64 JSON to pass through OAuth flow
    const state = Buffer.from(JSON.stringify({ termsAccepted })).toString('base64');

    return { state };
  }
}
