import { Request, Response, NextFunction } from 'express';

/**
 * Trims and strips non-printable control characters.
 * Enforces maximum character length if specified.
 */
export function sanitizeText(s: unknown, max?: number): string {
  if (typeof s !== 'string') return '';
  // Strip ASCII control characters except newline/tab if needed, or strip all 0x00-0x1F and 0x7F
  const sanitized = s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '').trim();
  return typeof max === 'number' && max > 0 ? sanitized.slice(0, max) : sanitized;
}

/**
 * Enforces that POST, PUT, and PATCH requests provide application/json Content-Type when sending a body.
 */
export function enforceJsonContentType(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentLength = req.headers['content-length'];
    if (contentLength && contentLength !== '0') {
      if (!req.is('application/json')) {
        res.status(400).json({
          ok: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Content-Type must be application/json'
          }
        });
        return;
      }
    }
  }
  next();
}

export interface FieldValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  allowedValues?: any[];
}

/**
 * Middleware factory to validate required request body fields, types, and ranges.
 * Returns HTTP 400 with code INVALID_INPUT on failure.
 */
export function validateBody(rules: FieldValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Request body is missing or is not a valid JSON object'
        }
      });
      return;
    }

    for (const rule of rules) {
      const val = body[rule.field];

      // Required check
      if (rule.required && (val === undefined || val === null || val === '')) {
        res.status(400).json({
          ok: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Field '${rule.field}' is required`
          }
        });
        return;
      }

      if (val !== undefined && val !== null) {
        // Type check
        if (rule.type) {
          if (rule.type === 'array') {
            if (!Array.isArray(val)) {
              res.status(400).json({
                ok: false,
                error: {
                  code: 'INVALID_INPUT',
                  message: `Field '${rule.field}' must be an array`
                }
              });
              return;
            }
          } else if (typeof val !== rule.type) {
            res.status(400).json({
              ok: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Field '${rule.field}' must be of type ${rule.type}`
              }
            });
            return;
          }
        }

        // Numeric range check
        if (typeof val === 'number') {
          if (rule.min !== undefined && val < rule.min) {
            res.status(400).json({
              ok: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Field '${rule.field}' cannot be less than ${rule.min}`
              }
            });
            return;
          }
          if (rule.max !== undefined && val > rule.max) {
            res.status(400).json({
              ok: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Field '${rule.field}' cannot be greater than ${rule.max}`
              }
            });
            return;
          }
        }

        // String length check
        if (typeof val === 'string') {
          if (rule.min !== undefined && val.length < rule.min) {
            res.status(400).json({
              ok: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Field '${rule.field}' length must be at least ${rule.min} characters`
              }
            });
            return;
          }
          if (rule.max !== undefined && val.length > rule.max) {
            res.status(400).json({
              ok: false,
              error: {
                code: 'INVALID_INPUT',
                message: `Field '${rule.field}' length cannot exceed ${rule.max} characters`
              }
            });
            return;
          }
        }

        // Allowed values check
        if (rule.allowedValues && !rule.allowedValues.includes(val)) {
          res.status(400).json({
            ok: false,
            error: {
              code: 'INVALID_INPUT',
              message: `Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}`
            }
          });
          return;
        }
      }
    }

    next();
  };
}
