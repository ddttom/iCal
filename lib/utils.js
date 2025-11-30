const fs = require('fs');

/**
 * Checks if a file exists.
 * @param {string} filePath
 * @returns {boolean}
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

/**
 * Reads a file from disk.
 * @param {string} filePath 
 * @returns {string}
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Writes content to a file.
 * @param {string} filePath 
 * @param {string} content 
 */
function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}

module.exports = {
    fileExists,
    readFile,
    writeFile
};
