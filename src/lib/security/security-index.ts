/**
 * GRIP Security Module Index
 * 모든 보안 모듈 통합 내보내기
 */

// Core Security
export * from './index';
export { default as Security } from './index';

// Headers
export * from './headers';
export { default as SecurityHeaders } from './headers';

// Authentication & Authorization
export * from './auth';
export { default as Auth } from './auth';

// Encryption
export * from './encryption';
export { default as Encryption } from './encryption';

// Network Security
export * from './network';
export { default as NetworkSecurity } from './network';

// Code Security
export * from './code-security';
export { CodeSecurityScanner as CodeSecurity } from './code-security';

// Environment Validator
export * from './env-validator';
export { default as EnvValidator } from './env-validator';

// Vulnerability Scanner
export * from './vulnerability-scanner';
export { default as VulnerabilityScanner } from './vulnerability-scanner';

// Advanced Security
export * from './advanced-security';
export { default as AdvancedSecurity } from './advanced-security';

// Compliance & Privacy
export * from './compliance';
export { default as Compliance } from './compliance';

// Penetration Testing
export * from './penetration-test';
export { default as PenetrationTester } from './penetration-test';

// ============================================
// Security Summary
// ============================================

/**
 * GRIP Security System Features:
 * 
 * 1. XSS Prevention (Cross-Site Scripting)
 *    - HTML sanitization
 *    - Content Security Policy
 *    - Input validation
 * 
 * 2. CSRF Prevention (Cross-Site Request Forgery)
 *    - Token-based validation
 *    - SameSite cookies
 *    - Origin/Referer verification
 * 
 * 3. SQL Injection Prevention
 *    - Input escaping
 *    - Pattern detection
 *    - Parameterized queries
 * 
 * 4. Authentication & Authorization
 *    - Role-Based Access Control (RBAC)
 *    - JWT tokens
 *    - Session management
 *    - Account lockout
 *    - 2FA support
 * 
 * 5. Encryption
 *    - AES-256-GCM (symmetric)
 *    - RSA-4096 (asymmetric)
 *    - ECDSA P-384 (digital signatures)
 *    - SHA-256/512 hashing
 *    - HMAC message authentication
 *    - PBKDF2 key derivation
 * 
 * 6. Rate Limiting
 *    - IP-based limiting
 *    - Endpoint-specific limits
 *    - DDoS protection
 * 
 * 7. Security Headers
 *    - X-XSS-Protection
 *    - X-Content-Type-Options
 *    - X-Frame-Options
 *    - Strict-Transport-Security (HSTS)
 *    - Content-Security-Policy (CSP)
 *    - Referrer-Policy
 *    - Permissions-Policy
 *    - Cross-Origin policies
 * 
 * 8. Network Security
 *    - IP whitelist/blacklist
 *    - Bot detection
 *    - Firewall rules
 *    - Geo-blocking
 * 
 * 9. Code Security
 *    - Injection detection
 *    - Sensitive data detection
 *    - Dependency vulnerability check
 *    - Security code audit
 * 
 * 10. Advanced Security
 *     - Subresource Integrity (SRI)
 *     - Open Redirect prevention
 *     - SSRF prevention
 *     - XXE prevention
 *     - Insecure Deserialization prevention
 *     - Clickjacking protection
 *     - File upload security
 *     - Password breach checking (HIBP)
 *     - Browser fingerprinting
 * 
 * 11. Compliance & Privacy
 *     - GDPR compliance
 *     - Data deletion (Right to be Forgotten)
 *     - Data portability
 *     - Data anonymization
 *     - Retention policies
 *     - Privacy Impact Assessment
 *     - Cookie consent management
 *     - Access logging
 * 
 * 12. Penetration Testing
 *     - Automated security testing
 *     - OWASP Top 10 coverage
 *     - Authentication testing
 *     - Authorization testing
 *     - Session management testing
 *     - Input validation testing
 *     - Cryptography testing
 *     - Configuration testing
 *     - Information disclosure testing
 *     - Injection testing
 *     - XSS testing
 *     - CSRF testing
 */

// Version info
export const SECURITY_VERSION = '1.0.0';
export const SECURITY_LAST_UPDATED = '2024-12-05';

