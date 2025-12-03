const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
    constructor(dbPath) {
        this.dbPath = dbPath || path.resolve('calendar.db');
        this.db = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    return reject(err);
                }
                this.createTable().then(resolve).catch(reject);
            });
        });
    }

    createTable() {
        return new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS events (
                    uid TEXT PRIMARY KEY,
                    summary TEXT,
                    description TEXT,
                    location TEXT,
                    startDate TEXT,
                    endDate TEXT,
                    rrule TEXT,
                    raw_data TEXT
                )
            `;
            this.db.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    getAllEvents(limit = 100, offset = 0) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM events LIMIT ? OFFSET ?';
            this.db.all(sql, [limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getEventCount() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM events';
            this.db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }

    getEvent(uid) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM events WHERE uid = ?';
            this.db.get(sql, [uid], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    createEvent(event) {
        return new Promise((resolve, reject) => {
            const uid = event.uid || uuidv4();
            const sql = `
                INSERT OR REPLACE INTO events (uid, summary, description, location, startDate, endDate, rrule, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                uid,
                event.summary,
                event.description || '',
                event.location || '',
                event.startDate,
                event.endDate || null,
                event.rrule || null,
                event.raw_data || JSON.stringify(event)
            ];
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(uid);
            });
        });
    }

    updateEvent(uid, event) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE events 
                SET summary = ?, description = ?, location = ?, startDate = ?, endDate = ?, rrule = ?, raw_data = ?
                WHERE uid = ?
            `;
            const params = [
                event.summary,
                event.description || '',
                event.location || '',
                event.startDate,
                event.endDate || null,
                event.rrule || null,
                event.raw_data || JSON.stringify(event),
                uid
            ];
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    deleteEvent(uid) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM events WHERE uid = ?';
            this.db.run(sql, [uid], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    searchEvents(query, startDate, endDate, limit = 100, offset = 0) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM events WHERE 1=1';
            const params = [];

            if (query) {
                sql += ' AND (summary LIKE ? OR description LIKE ? OR location LIKE ?)';
                const likeQuery = `%${query}%`;
                params.push(likeQuery, likeQuery, likeQuery);
            }

            if (startDate) {
                sql += ' AND (COALESCE(endDate, startDate) >= ?)';
                params.push(startDate);
            }

            if (endDate) {
                sql += ' AND (startDate <= ?)';
                params.push(endDate);
            }

            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getSearchCount(query, startDate, endDate) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
            const params = [];

            if (query) {
                sql += ' AND (summary LIKE ? OR description LIKE ? OR location LIKE ?)';
                const likeQuery = `%${query}%`;
                params.push(likeQuery, likeQuery, likeQuery);
            }

            if (startDate) {
                sql += ' AND (COALESCE(endDate, startDate) >= ?)';
                params.push(startDate);
            }

            if (endDate) {
                sql += ' AND (startDate <= ?)';
                params.push(endDate);
            }

            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }
    
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = Database;
