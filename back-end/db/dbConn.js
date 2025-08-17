// back-end/db/dbConn.js
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

conn.connect((err) => {
  if (err) {
    console.log('ERROR: ' + err.message);
    return;
  }
  console.log('Connection established');
});

let dataPool = {};

/* ===================== USERS ===================== */

dataPool.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT uid, username, name, phone_number, type, start_date FROM Users',
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.AuthUser = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT uid, username, password, name, phone_number, type FROM Users WHERE username = ?',
      [username],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.AuthNumber = (phone) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT uid, username, phone_number FROM Users WHERE phone_number = ?',
      [phone],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.addUser = (username, password, name, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Users (username, password, name, phone_number, start_date) VALUES (?, ?, ?, ?, ?)',
      [username, password, name, phoneNumber, startDate],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.updateUserPassword = (uid, hashedPassword) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Users SET password = ? WHERE uid = ?',
      [hashedPassword, uid],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.updateUser = (uid, username, password, name, type, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Users SET username = ?, password = ?, name = ?, type = ?, phone_number = ?, start_date = ? WHERE uid = ?',
      [username, password, name, type, phoneNumber, startDate, uid],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

// Partial update (no password/start_date)
dataPool.updateUserPartial = (uid, { username, name, phone_number, type }) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Users SET username = ?, name = ?, phone_number = ?, type = ? WHERE uid = ?',
      [username, name, phone_number, type, uid],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.deleteUser = (uid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Users WHERE uid = ?', [uid], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

/* ===================== MACHINES ===================== */

dataPool.getAllMachines = () => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Machines', (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.addMachine = (name, type, location, latitude, longitude, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Machines (name, type, location, latitude, longitude, startDate) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, location, latitude, longitude, startDate],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.updateMachine = (mid, name, type, location, latitude, longitude, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Machines SET name = ?, type = ?, location = ?, latitude = ?, longitude = ?, startDate = ? WHERE mid = ?',
      [name, type, location, latitude, longitude, startDate, mid],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

dataPool.deleteMachine = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Machines WHERE mid = ?', [mid], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.oneMachine = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Machines WHERE mid = ?', [mid], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.checkMachineExists = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT 1 FROM Machines WHERE mid = ?', [mid], (err, res) =>
      err ? reject(err) : resolve(res.length > 0)
    );
  });
};

// Insert stub machine with explicit mid (used when importing unknown mid)
dataPool.insertMachine = (mid) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Machines (mid) VALUES (?)`;
    conn.query(query, [mid], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

// Create the machine if it doesn't exist yet. Optionally set startDate.
// If it exists and has no startDate, we fill it in.
// Resolves: { created: boolean, updated: boolean, mid, startDate }
dataPool.ensureMachine = (mid, startDate = null) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT mid, startDate FROM Machines WHERE mid = ?',
      [mid],
      (err, rows) => {
        if (err) return reject(err);

        // Not found? Insert stub with optional startDate
        if (!rows || rows.length === 0) {
          conn.query(
            'INSERT INTO Machines (mid, startDate) VALUES (?, ?)',
            [mid, startDate],
            (err2) => {
              if (err2) return reject(err2);
              return resolve({ created: true, updated: false, mid, startDate });
            }
          );
          return;
        }

        // Found. If it has no startDate and we got one, update it.
        const existing = rows[0];
        if (!existing.startDate && startDate) {
          conn.query(
            'UPDATE Machines SET startDate = ? WHERE mid = ?',
            [startDate, mid],
            (err3) => {
              if (err3) return reject(err3);
              return resolve({ created: false, updated: true, mid, startDate });
            }
          );
          return;
        }

        // Exists and nothing to change
        return resolve({
          created: false,
          updated: false,
          mid,
          startDate: existing.startDate || startDate || null,
        });
      }
    );
  });
};


/* ===================== TABLE CREATION ===================== */

dataPool.createRTables = () => {
  return new Promise((resolve, reject) => {
    const createUsersTable = `
CREATE TABLE IF NOT EXISTS Users (
  uid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  phone_number VARCHAR(100),
  start_date DATE,
  type VARCHAR(100) DEFAULT 'worker'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    // NOTE: startDate is DATETIME now
    const createMachinesTable = `
CREATE TABLE IF NOT EXISTS Machines (
  mid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(100),
  location VARCHAR(100),
  startDate DATETIME,
  latitude FLOAT,
  longitude FLOAT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createReportsTable = `
CREATE TABLE IF NOT EXISTS Reports (
  rid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  mid INT NOT NULL,
  date_time DATETIME,
  FOREIGN KEY (uid) REFERENCES Users(uid),
  FOREIGN KEY (mid) REFERENCES Machines(mid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS Notifications (
  nid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  mid INT,
  title VARCHAR(255),
  message TEXT,
  urgent BOOLEAN DEFAULT FALSE,
  is_done BOOLEAN DEFAULT FALSE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES Users(uid),
  FOREIGN KEY (mid) REFERENCES Machines(mid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    // CashFlow & Product with auto IDs + date_time column
    const createCashFlowTable = `
CREATE TABLE IF NOT EXISTS CashFlow (
  cashid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  mid INT NOT NULL,
  cashflow_type VARCHAR(100),
  cash_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createProductTable = `
CREATE TABLE IF NOT EXISTS Product (
  productid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  mid INT NOT NULL,
  product_type VARCHAR(100),
  product_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createSelectionsTable = `
CREATE TABLE IF NOT EXISTS Selections (
  selection_id INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createFailuresTable = `
CREATE TABLE IF NOT EXISTS Failures (
  failid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createReportTotalsTable = `
CREATE TABLE IF NOT EXISTS ReportTotals (
  totalid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createPriceBandsTable = `
CREATE TABLE IF NOT EXISTS PriceBands (
  priceid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    const createCoinMechDataTable = `
CREATE TABLE IF NOT EXISTS CoinMechData (
  coinid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

    // Chain creation in order
    conn.query(createUsersTable, (err) => {
      if (err) return reject(err);
      conn.query(createMachinesTable, (err) => {
        if (err) return reject(err);
        conn.query(createReportsTable, (err) => {
          if (err) return reject(err);
          conn.query(createNotificationsTable, (err) => {
            if (err) return reject(err);
            conn.query(createProductTable, (err) => {
              if (err) return reject(err);
              conn.query(createCashFlowTable, (err) => {
                if (err) return reject(err);
                conn.query(createSelectionsTable, (err) => {
                  if (err) return reject(err);
                  conn.query(createFailuresTable, (err) => {
                    if (err) return reject(err);
                    conn.query(createReportTotalsTable, (err) => {
                      if (err) return reject(err);
                      conn.query(createPriceBandsTable, (err) => {
                        if (err) return reject(err);
                        conn.query(createCoinMechDataTable, (err) => {
                          if (err) return reject(err);
                          resolve("All tables created successfully or already exist.");
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};


/* ===================== REPORT + SUBTABLES ===================== */

dataPool.insertReport = (uid, mid, dateTime) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Reports (uid, mid, date_time) VALUES (?, ?, ?)`;
    conn.query(query, [uid, mid, dateTime], (err, res) =>
      err ? reject(err) : resolve(res.insertId)
    );
  });
};

dataPool.insertSelections = (rid, selections) => {
  // selections: [{ type, amount, description }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(selections) || selections.length === 0)
      return resolve({ affectedRows: 0 });
    const values = selections.map((s) => [rid, s.type, s.amount ?? 0, s.description || '']);
    const sql = `INSERT INTO Selections (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.insertPriceBands = (rid, bands) => {
  // bands: [{ type, amount, description }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(bands) || bands.length === 0)
      return resolve({ affectedRows: 0 });
    const values = bands.map((b) => [rid, b.type, b.amount ?? 0, b.description || '']);
    const sql = `INSERT INTO PriceBands (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.insertFailures = (rid, failures) => {
  // failures: [{ type, amount, description }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(failures) || failures.length === 0)
      return resolve({ affectedRows: 0 });
    const values = failures.map((f) => [rid, f.type, f.amount ?? 0, f.description || '']);
    const sql = `INSERT INTO Failures (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.insertCoinMechData = (rid, coinMechData) => {
  // coinMechData: { "Audit 1": n, "Audit 2": n, ... } or any key->amount
  return new Promise((resolve, reject) => {
    const types = Object.keys(coinMechData || {});
    if (types.length === 0) return resolve({ affectedRows: 0 });
    const values = types.map((type) => [rid, type, Number(coinMechData[type]) || 0, '']);
    const sql = `INSERT INTO CoinMechData (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.insertReportTotals = (rid, totalsRows) => {
  // totalsRows: [{ type, amount, description }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(totalsRows) || totalsRows.length === 0)
      return resolve({ affectedRows: 0 });
    const values = totalsRows.map((t) => [rid, t.type, t.amount ?? 0, t.description || '']);
    const sql = `INSERT INTO ReportTotals (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

/* ===================== NOTIFICATIONS ===================== */

// Return notifications; if uidOrNull is provided, filter by that receiver.
// Includes username/name for display (JOIN Users).
dataPool.getNotifications = (uidOrNull) => {
  return new Promise((resolve, reject) => {
    const base = `
      SELECT
        n.nid,
        n.uid,
        u.username,
        u.name,
        n.mid,
        n.title,
        n.message,
        n.urgent,
        n.is_done,
        n.timestamp
      FROM Notifications n
      LEFT JOIN Users u ON u.uid = n.uid
    `;
    const order = ` ORDER BY n.timestamp DESC, n.nid DESC`;

    const sql = uidOrNull
      ? base + ` WHERE n.uid = ?` + order
      : base + order;

    conn.query(sql, uidOrNull ? [uidOrNull] : [], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.addNotificationFull = (uid, mid, title, message, urgent) => {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO Notifications (uid, mid, title, message, urgent, is_done)
      VALUES (?, ?, ?, ?, ?, 0)
    `;
    conn.query(insertSql, [uid, mid, title, message, urgent ? 1 : 0], (err, res) => {
      if (err) return reject(err);
      const nid = res.insertId;
      const selectSql = `
        SELECT
          n.nid,
          n.uid,
          u.username,
          u.name,
          n.mid,
          n.title,
          n.message,
          n.urgent,
          n.is_done,
          n.timestamp
        FROM Notifications n
        LEFT JOIN Users u ON u.uid = n.uid
        WHERE n.nid = ?
        LIMIT 1
      `;
      conn.query(selectSql, [nid], (err2, rows) => {
        if (err2) return reject(err2);
        resolve(rows && rows[0] ? rows[0] : { nid });
      });
    });
  });
};

// Kept for convenience (same as above, object input)
dataPool.addNotificationRow = ({ uid, mid, title, message, urgent }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Notifications (uid, mid, title, message, urgent, is_done)
      VALUES (?, ?, ?, ?, ?, 0)
    `;
    conn.query(sql, [uid, mid, title, message, urgent ? 1 : 0], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.getNotificationById = (nid) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        n.nid,
        n.uid,
        u.username,
        u.name,
        n.mid,
        n.title,
        n.message,
        n.urgent,
        n.is_done,
        n.timestamp
      FROM Notifications n
      LEFT JOIN Users u ON u.uid = n.uid
      WHERE n.nid = ?
      LIMIT 1
    `;
    conn.query(sql, [nid], (err, res) => {
      if (err) return reject(err);
      resolve(res && res[0] ? res[0] : null);
    });
  });
};

dataPool.markNotificationDone = (nid) => {
  return new Promise((resolve, reject) => {
    conn.query(`UPDATE Notifications SET is_done = 1 WHERE nid = ?`, [nid], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

// List only workers (used by sender UI)
dataPool.getWorkers = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT uid, username, name FROM Users WHERE type = 'worker'`, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};
// Insert notification with explicit timestamp
dataPool.addNotificationFullAt = (uid, mid, title, message, urgent, timestamp) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Notifications (uid, mid, title, message, urgent, is_done, timestamp)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `;
    conn.query(
      sql,
      [uid, mid, title, message, urgent ? 1 : 0, timestamp],
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });
};

/* ===================== CASH FLOW ===================== */

dataPool.addCashFlow = (dateTime, mid, cashType, amount, description = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO CashFlow (date_time, mid, cashflow_type, cash_amount, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    conn.query(sql, [dateTime, mid, cashType, amount, description], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.addCashFlowBulk = (dateTime, mid, items) => {
  // items: [{ cashtype, amount, description? }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(items) || items.length === 0) return resolve({ affectedRows: 0 });
    const values = items.map((it) => [
      dateTime,
      mid,
      String(it.cashtype).trim(),
      Number(it.amount),
      it.description ? String(it.description).trim() : null,
    ]);
    const sql = `
      INSERT INTO CashFlow (date_time, mid, cashflow_type, cash_amount, description)
      VALUES ?
    `;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.listCashFlow = (midOrNull) => {
  return new Promise((resolve, reject) => {
    const sql = midOrNull
      ? `SELECT * FROM CashFlow WHERE mid = ? ORDER BY date_time DESC, cashid DESC`
      : `SELECT * FROM CashFlow ORDER BY date_time DESC, cashid DESC`;
    conn.query(sql, midOrNull ? [midOrNull] : [], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

/* ===================== PRODUCT (INVENTORY) ===================== */

dataPool.addProductBulk = (dateTime, mid, products) => {
  // products: [{ product_type, grams }]
  return new Promise((resolve, reject) => {
    if (!Array.isArray(products) || products.length === 0)
      return resolve({ affectedRows: 0 });
    const values = products.map((p) => [
      dateTime,
      mid,
      String(p.product_type).trim(),
      Number(p.grams),
      null,
    ]);
    const sql = `
      INSERT INTO Product (date_time, mid, product_type, product_amount, description)
      VALUES ?
    `;
    conn.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
  });
};

dataPool.addProduct = (dateTime, mid, productType, grams, description = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Product (date_time, mid, product_type, product_amount, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    conn.query(sql, [dateTime, mid, productType, grams, description], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};

dataPool.listProducts = (midOrNull) => {
  return new Promise((resolve, reject) => {
    const sql = midOrNull
      ? `SELECT * FROM Product WHERE mid = ? ORDER BY date_time DESC, productid DESC`
      : `SELECT * FROM Product ORDER BY date_time DESC, productid DESC`;
    conn.query(sql, midOrNull ? [midOrNull] : [], (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};
// Find report rid for a machine on a given date
dataPool.getReportRidByMidDate = (mid, date) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT rid FROM Reports
      WHERE mid = ? AND DATE(date_time) = ?
      ORDER BY date_time DESC
      LIMIT 1
    `;
    conn.query(sql, [mid, date], (err, rows) => {
      if (err) return reject(err);
      resolve(rows?.[0]?.rid || null);
    });
  });
};

// Rid-scoped readers
dataPool.getSelectionsByRid = (rid) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT type, amount, description FROM Selections WHERE rid = ?`, [rid], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
};
dataPool.getPriceBandsByRid = (rid) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT type, amount, description FROM PriceBands WHERE rid = ?`, [rid], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
};
dataPool.getCoinMechByRid = (rid) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT type, amount, description FROM CoinMechData WHERE rid = ?`, [rid], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
};
dataPool.getFailuresByRid = (rid) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT type, amount, description FROM Failures WHERE rid = ?`, [rid], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
};
dataPool.getReportTotalsByRid = (rid) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT type, amount, description FROM ReportTotals WHERE rid = ?`, [rid], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
};

// Product by mid & date
dataPool.listProductsByMidDate = (mid, date) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT product_type, product_amount, description, date_time
      FROM Product
      WHERE mid = ? AND DATE(date_time) = ?
      ORDER BY date_time DESC, productid DESC
    `;
    conn.query(sql, [mid, date], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

// Cashflow by mid & date
dataPool.listCashFlowByMidDate = (mid, date) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT cashflow_type, cash_amount, description, date_time
      FROM CashFlow
      WHERE mid = ? AND DATE(date_time) = ?
      ORDER BY date_time DESC, cashid DESC
    `;
    conn.query(sql, [mid, date], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

// IMPORTANT: your updateMachine already supports lat/lng/startDate in your newer version.
// Ensure its signature is:
/// updateMachine(mid, name, type, location, latitude, longitude, startDate)
// ----- Product range -----
dataPool.listProductsByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT product_type, product_amount, description, date_time
      FROM Product
      WHERE mid = ?
        AND date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY date_time ASC, productid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

// ----- Cashflow range -----
dataPool.listCashFlowByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT cashflow_type, cash_amount, description, date_time
      FROM CashFlow
      WHERE mid = ?
        AND date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY date_time ASC, cashid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

// ----- Selections range (join Reports) -----
dataPool.getSelectionsByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT s.type, s.amount, s.description, r.date_time
      FROM Selections s
      JOIN Reports r ON r.rid = s.rid
      WHERE r.mid = ?
        AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY r.date_time ASC, s.selection_id ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

dataPool.getPriceBandsByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.type, p.amount, p.description, r.date_time
      FROM PriceBands p
      JOIN Reports r ON r.rid = p.rid
      WHERE r.mid = ?
        AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY r.date_time ASC, p.priceid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

dataPool.getCoinMechByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT c.type, c.amount, c.description, r.date_time
      FROM CoinMechData c
      JOIN Reports r ON r.rid = c.rid
      WHERE r.mid = ?
        AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY r.date_time ASC, c.coinid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

dataPool.getFailuresByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT f.type, f.amount, f.description, r.date_time
      FROM Failures f
      JOIN Reports r ON r.rid = f.rid
      WHERE r.mid = ?
        AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY r.date_time ASC, f.failid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

dataPool.getReportTotalsByMidRange = (mid, start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT t.type, t.amount, t.description, r.date_time
      FROM ReportTotals t
      JOIN Reports r ON r.rid = t.rid
      WHERE r.mid = ?
        AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      ORDER BY r.date_time ASC, t.totalid ASC
    `;
    conn.query(sql, [mid, start, end], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

module.exports = dataPool;
