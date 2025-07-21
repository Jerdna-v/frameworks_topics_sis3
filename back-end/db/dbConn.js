const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, 
    database: process.env.DB_DATABASE,
  })

 conn.connect((err) => {
      if(err){
          console.log("ERROR: " + err.message);
          return;    
      }
      console.log('Connection established');
    })


    let dataPool={}
  


dataPool.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Users', (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.AuthUser = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT username, password FROM Users WHERE username = ?',
      [username],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};
dataPool.AuthNumber = (phone) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT username, phone_number, password FROM Users WHERE phone_number = ?',
      [phone],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.addUser = (username, password, name, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Users (username, password, name, phone_number, start_date) VALUES (?, ?, ?, ?, ?)',
      [username, password, name, phoneNumber, startDate],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};
dataPool.updateUser = (uid, username, password, name, type, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Users SET username = ?, password = ?, name = ?, type = ?, phone_number = ?, start_date = ? WHERE uid = ?',
      [username, password, name, type, phoneNumber, startDate, uid],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.deleteUser = (uid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Users WHERE uid = ?', [uid], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};
dataPool.getAllNotifications = () => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Notifications', (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.addNotification = (uid, muid, type, context) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Notifications (uid, muid, type, context) VALUES (?, ?, ?, ?)',
      [uid, muid, type, context],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.deleteNotification = (nuid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Notifications WHERE nuid = ?', [nuid], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};


dataPool.getAllMachines = () => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Machines', (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.addMachine = (name, type, location, latitude, longitude, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Machines (name, type, location, latitude, longitude, start_date) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, location, latitude, longitude, startDate],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};
dataPool.updateMachine = (mid, name, type, location, latitude, longitude, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Machines SET name = ?, type = ?, location = ?, latitude = ?, longitude = ?, start_date = ? WHERE mid = ?',
      [name, type, location, latitude, longitude, startDate, mid],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.deleteMachine = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Machines WHERE mid = ?', [mid], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.oneMachine = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Machines WHERE mid = ?', [mid], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

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
);`;

const createMachinesTable = `
CREATE TABLE IF NOT EXISTS Machines (
  mid INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(100),
  location VARCHAR(100),
  startDate DATE,
  latitude FLOAT,
  longitude FLOAT
);`;

const createReportsTable = `
CREATE TABLE IF NOT EXISTS Reports (
  rid INT AUTO_INCREMENT PRIMARY KEY,
  uid INT NOT NULL,
  mid INT NOT NULL,
  date_time DATETIME,
  FOREIGN KEY (uid) REFERENCES Users(uid),
  FOREIGN KEY (mid) REFERENCES Machines(mid)
);`;

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
);`;

const createProductTable = `
CREATE TABLE IF NOT EXISTS Product (
  date_time DATETIME PRIMARY KEY,
  mid INT NOT NULL,
  product_type VARCHAR(100),
  product_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid)
);`;

const createCashFlowTable = `
CREATE TABLE IF NOT EXISTS CashFlow (
  date_time DATETIME PRIMARY KEY,
  mid INT NOT NULL,
  cashflow_type VARCHAR(100),
  cash_amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (mid) REFERENCES Machines(mid)
);`;

const createSelectionsTable = `
CREATE TABLE IF NOT EXISTS Selections (
  selection_id INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
);`;

const createFailuresTable = `
CREATE TABLE IF NOT EXISTS Failures (
  failid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
);`;

const createReportTotalsTable = `
CREATE TABLE IF NOT EXISTS ReportTotals (
  totalid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
);`;

const createPriceBandsTable = `
CREATE TABLE IF NOT EXISTS PriceBands (
  priceid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
);`;

const createCoinMechDataTable = `
CREATE TABLE IF NOT EXISTS CoinMechData (
  coinid INT AUTO_INCREMENT PRIMARY KEY,
  rid INT NOT NULL,
  type VARCHAR(100),
  amount INT DEFAULT 0,
  description TEXT,
  FOREIGN KEY (rid) REFERENCES Reports(rid)
);`;

// Chain the table creation queries
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


dataPool.insertReport = (uid, mid, dateTime) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Reports (uid, mid, date_time) VALUES (?, ?, ?)`;
    conn.query(query, [uid, mid, dateTime], (err, res) => {
      if (err) return reject(err);
      resolve(res.insertId); // Return the newly inserted rid
    });
  });
};



dataPool.insertSelections = (rid, selections) => {
  return new Promise((resolve, reject) => {
    const values = selections.map(sel => [rid, sel.type, sel.amount, sel.description]);
    const sql = `INSERT INTO Selections (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};


dataPool.insertPriceBands = (rid, bands) => {
  return new Promise((resolve, reject) => {
    const values = bands.map(b => [rid, b.type, b.amount, b.description]);
    const sql = `INSERT INTO PriceBands (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};


dataPool.insertFailures = (rid, failures) => {
  return new Promise((resolve, reject) => {
    const values = failures.map(f => [rid, f.type, f.amount, f.description]);
    const sql = `INSERT INTO Failures (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};


dataPool.insertCoinMechData = (rid, coinMechData) => {
  return new Promise((resolve, reject) => {
    const types = Object.keys(coinMechData);
    const values = types.map(type => [rid, type, coinMechData[type], ""]);

    const sql = `INSERT INTO CoinMechData (rid, type, amount, description) VALUES ?`;
    conn.query(sql, [values], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.checkMachineExists = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT 1 FROM Machines WHERE mid = ?', [mid], (err, res) => {
      if (err) return reject(err);
      resolve(res.length > 0);
    });
  });
};

dataPool.insertMachine = (mid) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Machines (mid) VALUES (?)`;
    conn.query(query, [mid], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};


module.exports = dataPool;

