/**
 * Encryption Service Tests
 * 
 * Test suite for encryption/decryption functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from '../services/encryptionService';

describe('Encryption Service', () => {
  const testData = 'sensitive-api-key-12345';
  const testUserId = 'user-123';

  it('encrypts data successfully', () => {
    const encrypted = encryptionService.encrypt(testData, testUserId);
    
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(testData);
    expect(encrypted).toContain(':'); // IV separator
  });

  it('decrypts data successfully', () => {
    const encrypted = encryptionService.encrypt(testData, testUserId);
    const decrypted = encryptionService.decrypt(encrypted, testUserId);
    
    expect(decrypted).toBe(testData);
  });

  it('generates different ciphertext for same plaintext', () => {
    const encrypted1 = encryptionService.encrypt(testData, testUserId);
    const encrypted2 = encryptionService.encrypt(testData, testUserId);
    
    expect(encrypted1).not.toBe(encrypted2); // Different IVs
  });

  it('throws error when decrypting with wrong user ID', () => {
    const encrypted = encryptionService.encrypt(testData, testUserId);
    
    expect(() => {
      encryptionService.decrypt(encrypted, 'wrong-user-id');
    }).toThrow();
  });

  it('handles empty strings', () => {
    const encrypted = encryptionService.encrypt('', testUserId);
    const decrypted = encryptionService.decrypt(encrypted, testUserId);
    
    expect(decrypted).toBe('');
  });

  it('handles special characters', () => {
    const specialData = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./\n\t';
    const encrypted = encryptionService.encrypt(specialData, testUserId);
    const decrypted = encryptionService.decrypt(encrypted, testUserId);
    
    expect(decrypted).toBe(specialData);
  });

  it('handles unicode characters', () => {
    const unicodeData = '🚀 Hello 世界 مرحبا Привет';
    const encrypted = encryptionService.encrypt(unicodeData, testUserId);
    const decrypted = encryptionService.decrypt(encrypted, testUserId);
    
    expect(decrypted).toBe(unicodeData);
  });

  it('throws error for invalid encrypted format', () => {
    expect(() => {
      encryptionService.decrypt('invalid-format', testUserId);
    }).toThrow();
  });
});

