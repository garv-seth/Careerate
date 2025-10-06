/**
 * Enterprise-grade tests for Tech Stack Detector
 */

import { describe, it, expect } from '@jest/globals';
import { techStackDetector } from '../techStackDetector';

describe('TechStackDetector', () => {
  describe('detectFromRepository', () => {
    it('should detect Express.js application', async () => {
      const files = {
        'package.json': JSON.stringify({
          name: 'express-app',
          dependencies: {
            express: '^4.18.0'
          },
          scripts: {
            start: 'node server.js'
          }
        }),
        'server.js': 'const express = require("express");'
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.framework).toBe('express');
      expect(analysis.language).toBe('javascript');
      expect(analysis.port).toBe(3000);
      expect(analysis.confidence).toBeGreaterThan(0.9);
    });

    it('should detect Next.js application', async () => {
      const files = {
        'package.json': JSON.stringify({
          name: 'next-app',
          dependencies: {
            react: '^18.0.0',
            next: '^14.0.0'
          }
        }),
        'next.config.js': 'module.exports = {}'
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.framework).toBe('next');
      expect(analysis.buildCommand).toContain('next build');
      expect(analysis.startCommand).toContain('next start');
      expect(analysis.recommendations).toContain(expect.stringContaining('Vercel'));
    });

    it('should detect Python Flask application', async () => {
      const files = {
        'requirements.txt': 'flask==2.3.0\ngunicorn==21.0.0',
        'app.py': 'from flask import Flask\napp = Flask(__name__)'
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.framework).toBe('flask');
      expect(analysis.language).toBe('python');
      expect(analysis.port).toBe(8000);
      expect(analysis.installCommand).toContain('pip install');
    });

    it('should detect Go application', async () => {
      const files = {
        'go.mod': 'module github.com/user/app\n\ngo 1.21',
        'main.go': 'package main\n\nfunc main() {}'
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.framework).toBe('go');
      expect(analysis.language).toBe('go');
      expect(analysis.buildCommand).toContain('go build');
    });

    it('should extract environment variables from .env.example', async () => {
      const files = {
        'package.json': JSON.stringify({
          dependencies: { express: '^4.0.0' }
        }),
        '.env.example': 'DATABASE_URL=postgres://\nAPI_KEY=\nSECRET_KEY='
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.environmentVariables).toContain('DATABASE_URL');
      expect(analysis.environmentVariables).toContain('API_KEY');
      expect(analysis.environmentVariables).toContain('SECRET_KEY');
    });

    it('should detect package manager from lock files', async () => {
      const filesWithYarn = {
        'package.json': JSON.stringify({ dependencies: {} }),
        'yarn.lock': '# yarn lockfile'
      };

      const analysisYarn = await techStackDetector.detectFromRepository(filesWithYarn);
      expect(analysisYarn.packageManager).toBe('yarn');

      const filesWithPnpm = {
        'package.json': JSON.stringify({ dependencies: {} }),
        'pnpm-lock.yaml': 'lockfileVersion: 5.4'
      };

      const analysisPnpm = await techStackDetector.detectFromRepository(filesWithPnpm);
      expect(analysisPnpm.packageManager).toBe('pnpm');
    });

    it('should handle unknown tech stacks gracefully', async () => {
      const files = {
        'README.md': '# Unknown Project'
      };

      const analysis = await techStackDetector.detectFromRepository(files);

      expect(analysis.framework).toBe('unknown');
      expect(analysis.confidence).toBe(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('generateDockerfile', () => {
    it('should generate valid Node.js Dockerfile', () => {
      const analysis = {
        framework: 'express',
        language: 'javascript',
        packageManager: 'npm',
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        installCommand: 'npm ci',
        port: 3000,
        environmentVariables: [],
        dependencies: { production: [], development: [] },
        confidence: 0.95,
        recommendations: []
      };

      const dockerfile = techStackDetector.generateDockerfile(analysis);

      expect(dockerfile).toContain('FROM node:18-alpine');
      expect(dockerfile).toContain('npm ci');
      expect(dockerfile).toContain('EXPOSE 3000');
      expect(dockerfile).toContain('npm run build');
    });

    it('should generate multi-stage Dockerfile for production', () => {
      const analysis = {
        framework: 'next',
        language: 'javascript',
        packageManager: 'npm',
        buildCommand: 'next build',
        startCommand: 'next start',
        installCommand: 'npm ci',
        port: 3000,
        environmentVariables: [],
        dependencies: { production: [], development: [] },
        confidence: 0.95,
        recommendations: []
      };

      const dockerfile = techStackDetector.generateDockerfile(analysis);

      expect(dockerfile).toContain('AS builder');
      expect(dockerfile).toContain('--only=production');
    });

    it('should generate Python Dockerfile', () => {
      const analysis = {
        framework: 'fastapi',
        language: 'python',
        packageManager: 'pip',
        buildCommand: '',
        startCommand: 'uvicorn main:app',
        installCommand: 'pip install -r requirements.txt',
        port: 8000,
        environmentVariables: [],
        dependencies: { production: [], development: [] },
        confidence: 0.9,
        recommendations: []
      };

      const dockerfile = techStackDetector.generateDockerfile(analysis);

      expect(dockerfile).toContain('FROM python:3.11-slim');
      expect(dockerfile).toContain('pip install');
      expect(dockerfile).toContain('EXPOSE 8000');
    });

    it('should generate Go Dockerfile with multi-stage build', () => {
      const analysis = {
        framework: 'go',
        language: 'go',
        packageManager: 'go',
        buildCommand: 'go build -o app',
        startCommand: './app',
        installCommand: 'go mod download',
        port: 8080,
        environmentVariables: [],
        dependencies: { production: [], development: [] },
        confidence: 0.95,
        recommendations: []
      };

      const dockerfile = techStackDetector.generateDockerfile(analysis);

      expect(dockerfile).toContain('FROM golang');
      expect(dockerfile).toContain('AS builder');
      expect(dockerfile).toContain('FROM alpine:latest');
      expect(dockerfile).toContain('CGO_ENABLED=0');
    });
  });
});
