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

    getAllEvents(limit = 100, offset = 0, sortDir = 'ASC', filters = {}) {
        return new Promise((resolve, reject) => {
            const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            let sql = 'SELECT * FROM events WHERE 1=1';
            const params = [];

            if (filters.isAllDay) {
                // Heuristic: All day events usually have 10-char start date (YYYY-MM-DD) or we can check logic
                // But in DB we store ISO strings. 
                // Let's assume the client/importer sets a flag or we check string length?
                // The _mapRowToEvent does: isAllDay: row.startDate.length === 10
                sql += ' AND length(startDate) = 10';
            }
            if (filters.isRecurring) {
                sql += ' AND rrule IS NOT NULL';
            }


            sql += ` ORDER BY startDate ${direction} LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            this.db.all(sql, params, (err, rows) => {
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

    searchEvents(query, startDate, endDate, limit = 100, offset = 0, sortDir = 'ASC', filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM events WHERE 1=1';
            const params = [];

            if (query) {
                const dateQueries = this._parseDateQuery(query);
                let dateSql = '';
                const dateParams = [];
                const now = new Date().toISOString();
                
                if (dateQueries.length > 0) {
                    // Check for overlap: event start <= query end AND event end >= query start
                    // If endDate is NULL, treat it as NOW
                    const dateConditions = dateQueries.map(d => {
                        dateParams.push(`${d}T23:59:59`, now, `${d}T00:00:00`);
                        return '(startDate <= ? AND COALESCE(endDate, ?) >= ?)';
                    }).join(' OR ');
                    dateSql = ` OR ${dateConditions}`;
                }

                sql += ` AND (summary LIKE ? OR description LIKE ? OR location LIKE ?${dateSql})`;
                const likeQuery = `%${query}%`;
                params.push(likeQuery, likeQuery, likeQuery);
                
                params.push(...dateParams);
            }

            if (startDate) {
                // If endDate is NULL, treat as NOW
                const now = new Date().toISOString();
                sql += ' AND (COALESCE(endDate, ?) >= ?)';
                params.push(now, startDate);
            }

            if (endDate) {
                sql += ' AND (startDate <= ?)';
                params.push(endDate);
            }

            if (filters.isAllDay) {
                sql += ' AND length(startDate) = 10';
            }
            if (filters.isRecurring) {
                sql += ' AND rrule IS NOT NULL';
            }


            const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            sql += ` ORDER BY startDate ${direction} LIMIT ? OFFSET ?`;
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
                const dateQueries = this._parseDateQuery(query);
                let dateSql = '';
                
                if (dateQueries.length > 0) {
                    const dateConditions = dateQueries.map(() => 'startDate LIKE ?').join(' OR ');
                    dateSql = ` OR ${dateConditions}`;
                }

                sql += ` AND (summary LIKE ? OR description LIKE ? OR location LIKE ?${dateSql})`;
                const likeQuery = `%${query}%`;
                params.push(likeQuery, likeQuery, likeQuery);
                
                dateQueries.forEach(d => params.push(`${d}%`));
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

    _parseDateQuery(query) {
        const results = [];
        // DD/MM/YYYY or MM/DD/YYYY
        const match = query.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (match) {
            const [_, p1, p2, year] = match;
            const n1 = p1.padStart(2, '0');
            const n2 = p2.padStart(2, '0');
            
            // Possibility 1: p1 is Day, p2 is Month (DD/MM/YYYY) -> YYYY-MM-DD
            results.push(`${year}-${n2}-${n1}`);
            
            // Possibility 2: p1 is Month, p2 is Day (MM/DD/YYYY) -> YYYY-MM-DD
            // Only if p1 != p2 to avoid duplicates
            if (n1 !== n2) {
                results.push(`${year}-${n1}-${n2}`);
            }
        }
        
        // YYYY-MM-DD
        const isoMatch = query.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
        if (isoMatch) {
             const [_, year, month, day] = isoMatch;
             results.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        }
        
        return results;
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
