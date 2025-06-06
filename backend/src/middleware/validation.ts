/**
 * backend/src/middleware/validation.ts
 * Comprehensive schema-based validation system for Perfect LifeTracker Pro
 */
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';
import { logger } from '../utils/logger';

// Enhanced request interface for validation
interface ValidatedRequest extends Request {
  id?: string;
  validated?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

// Validation options interface
interface ValidationOptions {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  abortEarly?: boolean;
  convert?: boolean;
}

export class ValidationMiddleware {
  /**
   * Create validation middleware for request validation
   */
  static validate(options: ValidationOptions) {
    return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const validated: any = {};
        const errors: string[] = [];

        // Validation options with defaults
        const joiOptions = {
          stripUnknown: options.stripUnknown ?? true,
          allowUnknown: options.allowUnknown ?? false,
          abortEarly: options.abortEarly ?? false,
          convert: options.convert ?? true
        };

        // Validate request body
        if (options.body && req.body) {
          const { error, value } = options.body.validate(req.body, joiOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Body: ${detail.message}`));
          } else {
            validated.body = value;
            req.body = value;
          }
        }

        // Validate query parameters
        if (options.query && req.query) {
          const { error, value } = options.query.validate(req.query, joiOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Query: ${detail.message}`));
          } else {
            validated.query = value;
            req.query = value;
          }
        }

        // Validate route parameters
        if (options.params && req.params) {
          const { error, value } = options.params.validate(req.params, joiOptions);
          if (error) {
            errors.push(...error.details.map(detail => `Params: ${detail.message}`));
          } else {
            validated.params = value;
            req.params = value;
          }
        }

        // Handle validation errors
        if (errors.length > 0) {
          logger.warn('Request validation failed', {
            requestId: req.id,
            url: req.url,
            method: req.method,
            errors
          });

          throw new ValidationError('Request validation failed', {
            errors,
            invalidFields: errors.length
          });
        }

        // Attach validated data to request
        req.validated = validated;

        logger.info('Request validation successful', {
          requestId: req.id,
          url: req.url,
          method: req.method,
          validatedFields: Object.keys(validated)
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Common validation schemas for reuse
   */
  static schemas = {
    // MongoDB ObjectId validation
    objectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('Must be a valid MongoDB ObjectId'),

    // Email validation with normalization
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .lowercase()
      .trim()
      .max(320),

    // Password validation with complexity requirements
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Password must contain at least 8 characters with uppercase, lowercase, number, and special character'),

    // Username validation
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .lowercase()
      .trim(),

    // Name validation with sanitization
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .message('Name must contain only letters, spaces, hyphens, and apostrophes'),

    // Date validation
    date: Joi.date()
      .iso()
      .max('now'),

    // Pagination parameters
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    })
  };

  /**
   * Common validation middleware for specific routes
   */
  static common = {
    // User-related validations
    createUser: ValidationMiddleware.validate({
      body: Joi.object({
        email: ValidationMiddleware.schemas.email.required(),
        username: ValidationMiddleware.schemas.username.required(),
        password: ValidationMiddleware.schemas.password.required(),
        firstName: ValidationMiddleware.schemas.name.required(),
        lastName: ValidationMiddleware.schemas.name.required()
      })
    }),

    updateUser: ValidationMiddleware.validate({
      params: Joi.object({
        id: ValidationMiddleware.schemas.objectId.required()
      }),
      body: Joi.object({
        email: ValidationMiddleware.schemas.email.optional(),
        username: ValidationMiddleware.schemas.username.optional(),
        firstName: ValidationMiddleware.schemas.name.optional(),
        lastName: ValidationMiddleware.schemas.name.optional()
      }).min(1)
    }),

    // Task-related validations
    createTask: ValidationMiddleware.validate({
      body: Joi.object({
        title: Joi.string().trim().min(1).max(200).required(),
        description: Joi.string().trim().max(2000).optional(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        status: Joi.string().valid('todo', 'in-progress', 'completed', 'cancelled').default('todo'),
        dueDate: ValidationMiddleware.schemas.date.optional()
      })
    }),

    // Query parameter validations
    listItems: ValidationMiddleware.validate({
      query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'title').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
        search: Joi.string().trim().max(100).optional()
      })
    })
  };



  /**
   * Sanitization utilities
   */
  static sanitize = {
    /**
     * Remove potentially dangerous HTML tags and scripts
     */
    html: (input: string): string => {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    },

    /**
     * Remove SQL injection patterns
     */
    sql: (input: string): string => {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|"|`)/g,
        /(\bOR\b|\bAND\b)\s*(\d+\s*=\s*\d+|\w+\s*=\s*\w+)/gi
      ];
      
      let sanitized = input;
      sqlPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
      
      return sanitized.trim();
    }
  };

  /**
   * Direct access methods for backward compatibility
   */
  static validateCreateUser = ValidationMiddleware.common.createUser;
  static validateUpdateUser = ValidationMiddleware.common.updateUser;
  static validateCreateTask = ValidationMiddleware.common.createTask;
  static validateListItems = ValidationMiddleware.common.listItems;

  /**
   * Object ID validation middleware
   */
  static validateObjectId(paramName: string = 'id') {
    return ValidationMiddleware.validate({
      params: Joi.object({
        [paramName]: ValidationMiddleware.schemas.objectId.required()
      })
    });
  }

  /**
   * Update task validation
   */
  static validateUpdateTask = ValidationMiddleware.validate({
    body: Joi.object({
      title: Joi.string().trim().min(1).max(200).optional(),
      description: Joi.string().trim().max(2000).optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      status: Joi.string().valid('todo', 'in-progress', 'completed', 'cancelled').optional(),
      dueDate: ValidationMiddleware.schemas.date.optional()
    }).min(1)
  });
}

export default ValidationMiddleware; 