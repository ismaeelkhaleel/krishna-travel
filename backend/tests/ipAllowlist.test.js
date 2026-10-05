import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { ipAllowlist } from '../src/middleware/ipAllowlist.js';

describe('IP Allowlist Security Audit', () => {
  let app;

  beforeEach(() => {
    // Reset environment variables
    process.env.ALLOWED_IP_1 = '192.168.1.100';
    process.env.ALLOWED_IP_2 = '10.0.0.5';

    app = express();
    app.set('trust proxy', 1); // Trust first proxy
    app.use(ipAllowlist);
    app.get('/test', (req, res) => res.status(200).json({ success: true }));
  });

  afterEach(() => {
    delete process.env.ALLOWED_IP_1;
    delete process.env.ALLOWED_IP_2;
  });

  test('Allows ALLOWED_IP_1', async () => {
    const res = await request(app).get('/test').set('X-Forwarded-For', '192.168.1.100');
    expect(res.status).toBe(200);
  });

  test('Allows ALLOWED_IP_2', async () => {
    const res = await request(app).get('/test').set('X-Forwarded-For', '10.0.0.5');
    expect(res.status).toBe(200);
  });

  test('Denies unauthorized IP with HTTP 403', async () => {
    const res = await request(app).get('/test').set('X-Forwarded-For', '8.8.8.8');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access denied');
  });

  test('Spoofed X-Forwarded-For cannot bypass restriction when trust proxy is configured', async () => {
    // We simulate an attack where the client sends a spoofed allowed IP, 
    // but the actual connection comes from a malicious IP.
    // In express with trust proxy 1, the trusted proxy will append the malicious IP to X-Forwarded-For.
    // For example, if malicious client sends "192.168.1.100", Nginx appends "8.8.8.8", resulting in "192.168.1.100, 8.8.8.8".
    // Express with trust proxy=1 parses from the right, taking "8.8.8.8" as the real client IP.
    const res = await request(app)
      .get('/test')
      .set('X-Forwarded-For', '192.168.1.100, 8.8.8.8'); // Left is spoofed by client, right is added by trusted Nginx
    
    expect(res.status).toBe(403);
  });

  test('IPv4 mapped as IPv6 handling works', async () => {
    // Some systems map IPv4 as IPv6 like ::ffff:192.168.1.100
    const res = await request(app).get('/test').set('X-Forwarded-For', '::ffff:192.168.1.100');
    expect(res.status).toBe(200);
  });
});
