// back-end/db/dbConn.js
const mysql = require("mysql2/promise");

// create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,   // adjust as needed
  queueLimit: 0,
});

let dataPool = {};

/* ===================== USERS ===================== */

dataPool.getAllUsers = async () => {
  const [rows] = await pool.query(
    "SELECT uid, username, name, phone_number, type, start_date FROM Users"
  );
  return rows;
};

dataPool.AuthUser = async (username) => {
  const [rows] = await pool.query(
    "SELECT uid, username, password, name, phone_number, type FROM Users WHERE username = ?",
    [username]
  );
  return rows;
};

dataPool.AuthNumber = async (phone) => {
  const [rows] = await pool.query(
    "SELECT uid, username, phone_number FROM Users WHERE phone_number = ?",
    [phone]
  );
  return rows;
};

dataPool.addUser = async (username, password, name, phoneNumber, startDate) => {
  const [result] = await pool.query(
    "INSERT INTO Users (username, password, name, phone_number, start_date) VALUES (?, ?, ?, ?, ?)",
    [username, password, name, phoneNumber, startDate]
  );
  return result;
};

dataPool.updateUserPassword = async (uid, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE Users SET password = ? WHERE uid = ?",
    [hashedPassword, uid]
  );
  return result;
};

dataPool.updateUser = async (uid, username, password, name, type, phoneNumber, startDate) => {
  const [result] = await pool.query(
    "UPDATE Users SET username = ?, password = ?, name = ?, type = ?, phone_number = ?, start_date = ? WHERE uid = ?",
    [username, password, name, type, phoneNumber, startDate, uid]
  );
  return result;
};

dataPool.updateUserPartial = async (uid, { username, name, phone_number, type }) => {
  const [result] = await pool.query(
    "UPDATE Users SET username = ?, name = ?, phone_number = ?, type = ? WHERE uid = ?",
    [username, name, phone_number, type, uid]
  );
  return result;
};

dataPool.deleteUser = async (uid) => {
  const [result] = await pool.query("DELETE FROM Users WHERE uid = ?", [uid]);
  return result;
};
/* ===================== MACHINES ===================== */

dataPool.getAllMachines = async () => {
  const [rows] = await pool.query("SELECT * FROM Machines");
  return rows;
};

dataPool.addMachine = async (name, type, location, latitude, longitude, startDate) => {
  const [result] = await pool.query(
    "INSERT INTO Machines (name, type, location, latitude, longitude, startDate) VALUES (?, ?, ?, ?, ?, ?)",
    [name, type, location, latitude, longitude, startDate]
  );
  return result;
};

dataPool.updateMachine = async (mid, name, type, location, latitude, longitude, startDate) => {
  const [result] = await pool.query(
    "UPDATE Machines SET name = ?, type = ?, location = ?, latitude = ?, longitude = ?, startDate = ? WHERE mid = ?",
    [name, type, location, latitude, longitude, startDate, mid]
  );
  return result;
};

dataPool.deleteMachine = async (mid) => {
  const [result] = await pool.query("DELETE FROM Machines WHERE mid = ?", [mid]);
  return result;
};

dataPool.oneMachine = async (mid) => {
  const [rows] = await pool.query("SELECT * FROM Machines WHERE mid = ?", [mid]);
  return rows;
};

dataPool.checkMachineExists = async (mid) => {
  const [rows] = await pool.query("SELECT 1 FROM Machines WHERE mid = ?", [mid]);
  return rows.length > 0;
};

dataPool.insertMachine = async (mid) => {
  const [result] = await pool.query("INSERT INTO Machines (mid) VALUES (?)", [mid]);
  return result;
};

dataPool.ensureMachine = async (mid, startDate = null) => {
  const [rows] = await pool.query("SELECT mid, startDate FROM Machines WHERE mid = ?", [mid]);

  if (!rows || rows.length === 0) {
    await pool.query("INSERT INTO Machines (mid, startDate) VALUES (?, ?)", [mid, startDate]);
    return { created: true, updated: false, mid, startDate };
  }

  const existing = rows[0];
  if (!existing.startDate && startDate) {
    await pool.query("UPDATE Machines SET startDate = ? WHERE mid = ?", [startDate, mid]);
    return { created: false, updated: true, mid, startDate };
  }

  return {
    created: false,
    updated: false,
    mid,
    startDate: existing.startDate || startDate || null,
  };
};
/* ===================== SERVICE LOG ===================== */

dataPool.addService = async (dateTime, mid, uid, description) => {
  const [result] = await pool.query(
    `INSERT INTO Service (date_time, mid, uid, description)
     VALUES (?, ?, ?, ?)`,
    [dateTime, mid, uid, description]
  );
  return result;
};

dataPool.listService = async (midOrNull) => {
  const sql = midOrNull
    ? `SELECT * FROM Service WHERE mid = ? ORDER BY date_time DESC, servid DESC`
    : `SELECT * FROM Service ORDER BY date_time DESC, servid DESC`;

  const [rows] = await pool.query(sql, midOrNull ? [midOrNull] : []);
  return rows;
};


/* ===================== MECHANICAL (OVERALL COUNTER) ===================== */

dataPool.addMechanical = async (dateTime, mid, uid, mechanical) => {
  const [result] = await pool.query(
    `INSERT INTO Mechanical (date_time, mid, uid, mechanical)
     VALUES (?, ?, ?, ?)`,
    [dateTime, mid, uid, mechanical]
  );
  return result;
};

dataPool.listMechanical = async (midOrNull) => {
  const sql = midOrNull
    ? `SELECT * FROM Mechanical WHERE mid = ? ORDER BY date_time DESC, mecid DESC`
    : `SELECT * FROM Mechanical ORDER BY date_time DESC, mecid DESC`;

  const [rows] = await pool.query(sql, midOrNull ? [midOrNull] : []);
  return rows;
};
/* ===================== CASH FLOW ===================== */

dataPool.addCashFlow = async (dateTime, mid, uid, cashType, amount, description = null) => {
  const [result] = await pool.query(
    `INSERT INTO CashFlow (date_time, mid, uid, cashflow_type, cash_amount, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dateTime, mid, uid, cashType, amount, description]
  );
  return result;
};

dataPool.addCashFlowBulk = async (dateTime, mid, uid, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { affectedRows: 0 };
  }

  const values = items.map((it) => [
    dateTime,
    mid,
    uid,
    String(it.cashtype).trim(),
    Number(it.amount),
    it.description ? String(it.description).trim() : null,
  ]);

  const [result] = await pool.query(
    `INSERT INTO CashFlow (date_time, mid, uid, cashflow_type, cash_amount, description)
     VALUES ?`,
    [values]
  );
  return result;
};

dataPool.listCashFlow = async (midOrNull) => {
  const sql = midOrNull
    ? `SELECT * FROM CashFlow WHERE mid = ? ORDER BY date_time DESC, cashid DESC`
    : `SELECT * FROM CashFlow ORDER BY date_time DESC, cashid DESC`;

  const [rows] = await pool.query(sql, midOrNull ? [midOrNull] : []);
  return rows;
};


/* ===================== PRODUCT (INVENTORY) ===================== */

dataPool.addProductBulk = async (dateTime, mid, uid, products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return { affectedRows: 0 };
  }

  const values = products.map((p) => [
    dateTime,
    mid,
    uid,
    String(p.product_type).trim(),
    Number(p.grams),
    p.description ? String(p.description).trim() : null,
  ]);

  const [result] = await pool.query(
    `INSERT INTO Product (date_time, mid, uid, product_type, product_amount, description)
     VALUES ?`,
    [values]
  );
  return result;
};

dataPool.addProduct = async (dateTime, mid, uid, productType, grams, description = null) => {
  const [result] = await pool.query(
    `INSERT INTO Product (date_time, mid, uid, product_type, product_amount, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dateTime, mid, uid, productType, grams, description]
  );
  return result;
};

dataPool.listProducts = async (midOrNull) => {
  const sql = midOrNull
    ? `SELECT * FROM Product WHERE mid = ? ORDER BY date_time DESC, productid DESC`
    : `SELECT * FROM Product ORDER BY date_time DESC, productid DESC`;

  const [rows] = await pool.query(sql, midOrNull ? [midOrNull] : []);
  return rows;
};
/* ===================== REPORT + SUBTABLES ===================== */

dataPool.insertReport = async (uid, mid, dateTime) => {
  const [result] = await pool.query(
    `INSERT INTO Reports (uid, mid, date_time) VALUES (?, ?, ?)`,
    [uid, mid, dateTime]
  );
  return result.insertId; // return rid
};

dataPool.insertSelections = async (rid, selections) => {
  if (!Array.isArray(selections) || selections.length === 0) {
    return { affectedRows: 0 };
  }

  const values = selections.map((s) => [
    rid,
    s.type,
    s.amount ?? 0,
    s.description || '',
  ]);

  const [result] = await pool.query(
    `INSERT INTO Selections (rid, type, amount, description) VALUES ?`,
    [values]
  );
  return result;
};

dataPool.insertPriceBands = async (rid, bands) => {
  if (!Array.isArray(bands) || bands.length === 0) {
    return { affectedRows: 0 };
  }

  const values = bands.map((b) => [
    rid,
    b.type,
    b.amount ?? 0,
    b.description || '',
  ]);

  const [result] = await pool.query(
    `INSERT INTO PriceBands (rid, type, amount, description) VALUES ?`,
    [values]
  );
  return result;
};

dataPool.insertFailures = async (rid, failures) => {
  if (!Array.isArray(failures) || failures.length === 0) {
    return { affectedRows: 0 };
  }

  const values = failures.map((f) => [
    rid,
    f.type,
    f.amount ?? 0,
    f.description || '',
  ]);

  const [result] = await pool.query(
    `INSERT INTO Failures (rid, type, amount, description) VALUES ?`,
    [values]
  );
  return result;
};

dataPool.insertCoinMechData = async (rid, coinMechData) => {
  const types = Object.keys(coinMechData || {});
  if (types.length === 0) return { affectedRows: 0 };

  const values = types.map((type) => [
    rid,
    type,
    Number(coinMechData[type]) || 0,
    '',
  ]);

  const [result] = await pool.query(
    `INSERT INTO CoinMechData (rid, type, amount, description) VALUES ?`,
    [values]
  );
  return result;
};

dataPool.insertReportTotals = async (rid, totalsRows) => {
  if (!Array.isArray(totalsRows) || totalsRows.length === 0) {
    return { affectedRows: 0 };
  }

  const values = totalsRows.map((t) => [
    rid,
    t.type,
    t.amount ?? 0,
    t.description || '',
  ]);

  const [result] = await pool.query(
    `INSERT INTO ReportTotals (rid, type, amount, description) VALUES ?`,
    [values]
  );
  return result;
};
/* ===================== NOTIFICATIONS ===================== */

// Return notifications; if uidOrNull is provided, filter by that receiver.
// Includes username/name for display (JOIN Users).
dataPool.getNotifications = async (uidOrNull) => {
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

  const sql = uidOrNull ? base + ` WHERE n.uid = ?` + order : base + order;
  const [rows] = await pool.query(sql, uidOrNull ? [uidOrNull] : []);
  return rows;
};

dataPool.addNotificationFull = async (uid, mid, title, message, urgent) => {
  const insertSql = `
    INSERT INTO Notifications (uid, mid, title, message, urgent, is_done)
    VALUES (?, ?, ?, ?, ?, 0)
  `;
  const [result] = await pool.query(insertSql, [
    uid,
    mid,
    title,
    message,
    urgent ? 1 : 0,
  ]);
  const nid = result.insertId;

  // fetch back full row with JOIN
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
  const [rows] = await pool.query(selectSql, [nid]);
  return rows && rows[0] ? rows[0] : { nid };
};

// Convenience function (object input)
dataPool.addNotificationRow = async ({ uid, mid, title, message, urgent }) => {
  const sql = `
    INSERT INTO Notifications (uid, mid, title, message, urgent, is_done)
    VALUES (?, ?, ?, ?, ?, 0)
  `;
  const [result] = await pool.query(sql, [
    uid,
    mid,
    title,
    message,
    urgent ? 1 : 0,
  ]);
  return result;
};

dataPool.getNotificationById = async (nid) => {
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
  const [rows] = await pool.query(sql, [nid]);
  return rows && rows[0] ? rows[0] : null;
};

dataPool.markNotificationDone = async (nid) => {
  const [result] = await pool.query(
    `UPDATE Notifications SET is_done = 1 WHERE nid = ?`,
    [nid]
  );
  return result;
};

// List only workers (used by sender UI)
dataPool.getWorkers = async () => {
  const [rows] = await pool.query(
    `SELECT uid, username, name FROM Users WHERE type = 'worker'`
  );
  return rows;
};

// Insert notification with explicit timestamp
dataPool.addNotificationFullAt = async (
  uid,
  mid,
  title,
  message,
  urgent,
  timestamp
) => {
  const sql = `
    INSERT INTO Notifications (uid, mid, title, message, urgent, is_done, timestamp)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `;
  const [result] = await pool.query(sql, [
    uid,
    mid,
    title,
    message,
    urgent ? 1 : 0,
    timestamp,
  ]);
  return result;
};
/* ===================== RANGE QUERIES ===================== */

// ----- Product range -----
dataPool.listProductsByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT product_type, product_amount, description, date_time
    FROM Product
    WHERE mid = ?
      AND date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY date_time ASC, productid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

// ----- Cashflow range -----
dataPool.listCashFlowByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT cashflow_type, cash_amount, description, date_time
    FROM CashFlow
    WHERE mid = ?
      AND date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY date_time ASC, cashid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

// ----- Selections range (join Reports) -----
dataPool.getSelectionsByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT s.type, s.amount, s.description, r.date_time
    FROM Selections s
    JOIN Reports r ON r.rid = s.rid
    WHERE r.mid = ?
      AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY r.date_time ASC, s.selection_id ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

dataPool.getPriceBandsByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT p.type, p.amount, p.description, r.date_time
    FROM PriceBands p
    JOIN Reports r ON r.rid = p.rid
    WHERE r.mid = ?
      AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY r.date_time ASC, p.priceid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

dataPool.getCoinMechByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT c.type, c.amount, c.description, r.date_time
    FROM CoinMechData c
    JOIN Reports r ON r.rid = c.rid
    WHERE r.mid = ?
      AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY r.date_time ASC, c.coinid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

dataPool.getFailuresByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT f.type, f.amount, f.description, r.date_time
    FROM Failures f
    JOIN Reports r ON r.rid = f.rid
    WHERE r.mid = ?
      AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY r.date_time ASC, f.failid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};

dataPool.getReportTotalsByMidRange = async (mid, start, end) => {
  const sql = `
    SELECT t.type, t.amount, t.description, r.date_time
    FROM ReportTotals t
    JOIN Reports r ON r.rid = t.rid
    WHERE r.mid = ?
      AND r.date_time BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    ORDER BY r.date_time ASC, t.totalid ASC
  `;
  const [rows] = await pool.query(sql, [mid, start, end]);
  return rows;
};
// -------------------------------------------------------
// GET unique selections for a machine
// -------------------------------------------------------
dataPool.getUniqueSelections = async (mid) => {
  const sql = `
    SELECT DISTINCT selection
    FROM Selections
    WHERE mid = ?
    ORDER BY selection ASC
  `;
  const [rows] = await pool.query(sql, [mid]);
  return rows.map((r) => r.selection);
};

// -------------------------------------------------------
// GET existing price mapping for a machine
// -------------------------------------------------------
dataPool.getPriceLinks = async (mid) => {
  const sql = `
    SELECT selection, type AS price_group
    FROM Prices
    WHERE mid = ?
  `;
  const [rows] = await pool.query(sql, [mid]);
  return rows;
};

// -------------------------------------------------------
// INSERT price links (delete old + insert new)
// -------------------------------------------------------
dataPool.insertPriceLinks = async (mid, links) => {
  const deleteSql = `DELETE FROM Prices WHERE mid = ?`;
  await pool.query(deleteSql, [mid]);

  const insertSql = `
    INSERT INTO Prices (mid, type, selection)
    VALUES (?, ?, ?)
  `;

  for (const row of links) {
    await pool.query(insertSql, [
      mid,
      row.price_group.toString(),
      row.selection.toString(),
    ]);
  }

  return true;
};


/* ===================== TABLE CREATION ===================== */

dataPool.createRTables = async () => {
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

  const createCashFlowTable = `
CREATE TABLE IF NOT EXISTS CashFlow (
  cashid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  mid INT NOT NULL,
  uid INT NOT NULL,
  cashflow_type VARCHAR(100),
  cash_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid),
  FOREIGN KEY (uid) REFERENCES Users(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
  const createPricesTable= `
CREATE TABLE IF NOT EXISTS Prices (
  priceid INT AUTO_INCREMENT PRIMARY KEY,
  mid INT NOT NULL,
  type VARCHAR(100),
  selection VARCHAR(100),
  FOREIGN KEY (mid) REFERENCES Machines(mid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const createProductTable = `
CREATE TABLE IF NOT EXISTS Product (
  productid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  uid INT NOT NULL,
  mid INT NOT NULL,
  product_type VARCHAR(100),
  product_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid),
  FOREIGN KEY (uid) REFERENCES Users(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const createMechanicalTable = `
CREATE TABLE IF NOT EXISTS Mechanical (
  mecid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  uid INT NOT NULL,
  mid INT NOT NULL,
  mechanical BIGINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (mid) REFERENCES Machines(mid),
  FOREIGN KEY (uid) REFERENCES Users(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const createServiceTable = `
CREATE TABLE IF NOT EXISTS Service (
  servid INT AUTO_INCREMENT PRIMARY KEY,
  date_time DATETIME NOT NULL,
  mid INT NOT NULL,
  uid INT NOT NULL,
  description VARCHAR(255),
  FOREIGN KEY (mid) REFERENCES Machines(mid),
  FOREIGN KEY (uid) REFERENCES Users(uid)
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

  // Run sequentially to respect dependencies
  await pool.query(createUsersTable);
  await pool.query(createMachinesTable);
  await pool.query(createReportsTable);
  await pool.query(createNotificationsTable);
  await pool.query(createProductTable);
  await pool.query(createCashFlowTable);
  await pool.query(createSelectionsTable);
  await pool.query(createFailuresTable);
  await pool.query(createReportTotalsTable);
  await pool.query(createPriceBandsTable);
  await pool.query(createCoinMechDataTable);
  await pool.query(createMechanicalTable);
  await pool.query(createServiceTable);

  return "All tables created successfully or already exist.";
};

module.exports = dataPool;
