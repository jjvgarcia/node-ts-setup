import { describe, it, expect } from 'vitest';
import { validateRequiredFields, isValidEmail } from '../src/utils/validation';

describe('Utility Functions', () => {
  describe('validateRequiredFields', () => {
    it('should return valid when all required fields are present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const requiredFields = ['name', 'email'];
      
      const result = validateRequiredFields(data, requiredFields);
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('should return invalid when required fields are missing', () => {
      const data = { name: 'John' };
      const requiredFields = ['name', 'email'];
      
      const result = validateRequiredFields(data, requiredFields);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['email']);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });
});
