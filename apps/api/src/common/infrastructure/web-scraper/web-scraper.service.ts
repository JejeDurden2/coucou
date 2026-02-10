import { Injectable } from '@nestjs/common';

import { LoggerService } from '../../logger';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_CONTENT_LENGTH = 15_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; CoucouBot/1.0; +https://coucou-ia.com)';

@Injectable()
export class WebScraperService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(WebScraperService.name);
  }

  async fetchContent(url: string): Promise<string> {
    this.logger.info('Fetching web content', { url });

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/')) {
      throw new Error(`Unsupported content type "${contentType}" for ${url}`);
    }

    const html = await response.text();
    const text = this.stripHtml(html);

    this.logger.info('Successfully fetched web content', {
      url,
      rawLength: html.length,
      strippedLength: text.length,
    });

    if (text.length > MAX_CONTENT_LENGTH) {
      this.logger.warn('Content truncated', {
        url,
        originalLength: text.length,
        maxLength: MAX_CONTENT_LENGTH,
      });
    }

    return text.slice(0, MAX_CONTENT_LENGTH);
  }

  private stripHtml(html: string): string {
    return (
      html
        // Remove script/style/noscript blocks entirely
        .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, ' ')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }
}
