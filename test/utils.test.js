const fs = require('fs');
const path = require('path');
const { fileExists, readFile, writeFile } = require('../lib/utils');

describe('Utils Module', () => {
    const testDir = path.join(__dirname, 'temp');
    const testFile = path.join(testDir, 'test.txt');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('fileExists', () => {
        it('should return true for an existing file', () => {
            fs.writeFileSync(testFile, 'test content');
            expect(fileExists(testFile)).toBe(true);
        });

        it('should return false for a non-existing file', () => {
            expect(fileExists(testFile)).toBe(false);
        });

        it('should return false for an invalid path', () => {
            expect(fileExists('/invalid/path/that/does/not/exist.txt')).toBe(false);
        });

        it('should handle directory paths', () => {
            expect(fileExists(testDir)).toBe(true);
        });
    });

    describe('readFile', () => {
        it('should read file content correctly', () => {
            const content = 'Hello, World!';
            fs.writeFileSync(testFile, content);
            expect(readFile(testFile)).toBe(content);
        });

        it('should read multiline content correctly', () => {
            const content = 'Line 1\nLine 2\nLine 3';
            fs.writeFileSync(testFile, content);
            expect(readFile(testFile)).toBe(content);
        });

        it('should throw error for non-existing file', () => {
            expect(() => readFile(testFile)).toThrow();
        });

        it('should handle UTF-8 encoded content', () => {
            const content = 'Special chars: © ® ™ € £ ¥';
            fs.writeFileSync(testFile, content, 'utf-8');
            expect(readFile(testFile)).toBe(content);
        });
    });

    describe('writeFile', () => {
        it('should write content to file', () => {
            const content = 'Test content';
            writeFile(testFile, content);
            expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
        });

        it('should overwrite existing file content', () => {
            fs.writeFileSync(testFile, 'Original content');
            const newContent = 'New content';
            writeFile(testFile, newContent);
            expect(fs.readFileSync(testFile, 'utf-8')).toBe(newContent);
        });

        it('should handle multiline content', () => {
            const content = 'Line 1\nLine 2\nLine 3';
            writeFile(testFile, content);
            expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
        });

        it('should handle empty string', () => {
            writeFile(testFile, '');
            expect(fs.readFileSync(testFile, 'utf-8')).toBe('');
        });

        it('should throw error for invalid path', () => {
            expect(() => writeFile('/invalid/path/file.txt', 'content')).toThrow();
        });
    });
});
