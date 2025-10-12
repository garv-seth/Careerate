/**
 * Compression Middleware
 * 
 * Enables gzip/brotli compression for responses
 * Improves network performance and reduces bandwidth
 */

import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';

// Compression configuration
export const compressionMiddleware = compression({
  // Compression level (0-9, higher = more compression but slower)
  level: 6,
  
  // Minimum byte size to compress
  threshold: 1024, // 1KB
  
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Check if response should be compressed based on content type
    const contentType = res.getHeader('Content-Type');
    if (typeof contentType === 'string') {
      // Compress text-based content
      if (
        contentType.includes('text/') ||
        contentType.includes('application/json') ||
        contentType.includes('application/javascript') ||
        contentType.includes('application/xml') ||
        contentType.includes('image/svg+xml')
      ) {
        return true;
      }
    }

    // Use default compression filter
    return compression.filter(req, res);
  },
});

// Brotli compression for modern browsers (if available)
export function shouldUseBrotli(req: Request): boolean {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  return acceptEncoding.includes('br');
}

// Response header optimization
export function optimizeResponseHeaders(req: Request, res: Response, next: NextFunction) {
  // Enable HTTP/2 push hints
  if (req.path === '/' || req.path.endsWith('.html')) {
    // Preload critical assets
    res.setHeader('Link', [
      '</assets/index.js>; rel=preload; as=script',
      '</assets/index.css>; rel=preload; as=style',
      '</manifest.json>; rel=preload; as=manifest',
    ].join(', '));
  }

  // Security headers (already in place, but ensuring)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance hints
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  
  next();
}

// ETag generation for better caching
export function generateETag(content: string | Buffer): string {
  const crypto = require('crypto');
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
}

