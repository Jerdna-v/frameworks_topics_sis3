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
        if (err) {
          return reject(err);
        }
        return resolve(res);
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
        if (err) {
          return reject(err);
        }
        return resolve(res);
      }
    );
  });
};

dataPool.addUser = (username, password, name, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Users (username, password, name, phone_number, start_date) VALUES (?,?,?,?,?)',
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
    conn.query('DELETE FROM Users WHERE uid = ?', uid, (err, res) => {
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
      'INSERT INTO Notifications (uid, muid, type, context) VALUES (?,?,?,?)',
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
    conn.query('DELETE FROM Notifications WHERE nuid = ?', nuid, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.createTables = () => {
  return new Promise((resolve, reject) => {
    const createMachinesTable = `CREATE TABLE IF NOT EXISTS Machines (mid INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100),type VARCHAR(100),location VARCHAR(255), start_date DATE);`;
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS Users (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        password VARCHAR(255),
        name VARCHAR(100),
        type ENUM('owner', 'worker') DEFAULT 'worker',
        phone_number VARCHAR(15), start_date DATE);`;
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS Notifications (
        nuid INT AUTO_INCREMENT PRIMARY KEY,
        uid INT,
        muid INT,
        type VARCHAR(100),
        context TEXT,
        FOREIGN KEY (uid) REFERENCES Users(uid),
        FOREIGN KEY (muid) REFERENCES Machines(mid)
      );
    `;
 // Execute each query separately
 conn.query(createMachinesTable, (err) => {
  if (err) return reject(err);
  conn.query(createUsersTable, (err) => {
    if (err) return reject(err);
    conn.query(createNotificationsTable, (err) => {
      if (err) return reject(err);
      resolve("All tables created successfully or already exist.");
    });
  });
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

dataPool.addMachine = (name, type, location, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Machines (name, type, location, start_date) VALUES (?,?,?,?)',
      [name, type, location, startDate],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.updateMachine = (mid, name, type, location, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE Machines SET name = ?, type = ?, location = ?, start_date = ? WHERE mid = ?',
      [name, type, location, startDate, mid],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.deleteMachine = (mid) => {
  return new Promise((resolve, reject) => {
    conn.query('DELETE FROM Machines WHERE mid = ?', mid, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.oneMachine=(mid)=>{
  return new Promise ((resolve, reject)=>{
    conn.query(`SELECT * FROM Machines WHERE mid = ?`, mid, (err,res)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.createRTables = () => {
  return new Promise((resolve, reject) => {
      const createReportsTable = `
      CREATE TABLE IF NOT EXISTS Reports (
          rid INT AUTO_INCREMENT PRIMARY KEY,
          mid INT NOT NULL,
          total_count INT DEFAULT 0,
          total_sel_norm INT DEFAULT 0,
          total_sel_maint INT DEFAULT 0,
          total_sel_total INT DEFAULT 0,
          FOREIGN KEY (mid) REFERENCES Machines(mid)
      );`;

      const createSelectionsTable = `
      CREATE TABLE IF NOT EXISTS Selections (
          rid INT NOT NULL,
          mid INT NOT NULL,
          selection_1 INT DEFAULT 0,
          selection_2 INT DEFAULT 0,
          selection_3 INT DEFAULT 0,
          selection_4 INT DEFAULT 0,
          selection_5 INT DEFAULT 0,
          selection_6 INT DEFAULT 0,
          selection_7 INT DEFAULT 0,
          selection_8 INT DEFAULT 0,
          selection_9 INT DEFAULT 0,
          selection_10 INT DEFAULT 0,
          selection_11 INT DEFAULT 0,
          selection_12 INT DEFAULT 0,
          selection_13 INT DEFAULT 0,
          selection_14 INT DEFAULT 0,
          selection_15 INT DEFAULT 0,
          selection_16 INT DEFAULT 0,
          selection_17 INT DEFAULT 0,
          selection_18 INT DEFAULT 0,
          selection_19 INT DEFAULT 0,
          selection_20 INT DEFAULT 0,
          selection_21 INT DEFAULT 0,
          selection_22 INT DEFAULT 0,
          selection_23 INT DEFAULT 0,
          selection_24 INT DEFAULT 0,
          selection_25 INT DEFAULT 0,
          selection_26 INT DEFAULT 0,
          selection_27 INT DEFAULT 0,
          selection_28 INT DEFAULT 0,
          selection_29 INT DEFAULT 0,
          selection_30 INT DEFAULT 0,
          selection_31 INT DEFAULT 0,
          selection_32 INT DEFAULT 0,
          selection_33 INT DEFAULT 0,
          selection_34 INT DEFAULT 0,
          selection_35 INT DEFAULT 0,
          selection_36 INT DEFAULT 0,
          selection_37 INT DEFAULT 0,
          selection_38 INT DEFAULT 0,
          selection_39 INT DEFAULT 0,
          selection_40 INT DEFAULT 0,
          PRIMARY KEY (rid),
          FOREIGN KEY (rid) REFERENCES Reports(rid),
          FOREIGN KEY (mid) REFERENCES Machines(mid)
      );`;

      const createPriceBandsTable = `
      CREATE TABLE IF NOT EXISTS PriceBands (
          rid INT NOT NULL,
          mid INT NOT NULL,
          band_0 INT DEFAULT 0,
          band_1 INT DEFAULT 0,
          band_2 INT DEFAULT 0,
          band_3 INT DEFAULT 0,
          band_4 INT DEFAULT 0,
          band_5 INT DEFAULT 0,
          band_6 INT DEFAULT 0,
          band_7 INT DEFAULT 0,
          band_8 INT DEFAULT 0,
          PRIMARY KEY (rid),
          FOREIGN KEY (rid) REFERENCES Reports(rid),
          FOREIGN KEY (mid) REFERENCES Machines(mid)
      );`;

      const createFailuresTable = `
      CREATE TABLE IF NOT EXISTS Failures (
          rid INT NOT NULL,
          mid INT NOT NULL,
          failure_1 INT DEFAULT 0,
          failure_2 INT DEFAULT 0,
          failure_3 INT DEFAULT 0,
          failure_4 INT DEFAULT 0,
          failure_5 INT DEFAULT 0,
          failure_6 INT DEFAULT 0,
          failure_7 INT DEFAULT 0,
          failure_8 INT DEFAULT 0,
          failure_9 INT DEFAULT 0,
          failure_10 INT DEFAULT 0,
          failure_11 INT DEFAULT 0,
          failure_12 INT DEFAULT 0,
          failure_13 INT DEFAULT 0,
          failure_14 INT DEFAULT 0,
          failure_15 INT DEFAULT 0,
          failure_16 INT DEFAULT 0,
          failure_17 INT DEFAULT 0,
          failure_18 INT DEFAULT 0,
          failure_19 INT DEFAULT 0,
          failure_20 INT DEFAULT 0,
          failure_21 INT DEFAULT 0,
          failure_22 INT DEFAULT 0,
          failure_23 INT DEFAULT 0,
          failure_24 INT DEFAULT 0,
          failure_25 INT DEFAULT 0,
          failure_26 INT DEFAULT 0,
          failure_27 INT DEFAULT 0,
          failure_28 INT DEFAULT 0,
          failure_29 INT DEFAULT 0,
          failure_30 INT DEFAULT 0,
          failure_31 INT DEFAULT 0,
          failure_32 INT DEFAULT 0,
          failure_33 INT DEFAULT 0,
          failure_34 INT DEFAULT 0,
          failure_35 INT DEFAULT 0,
          failure_36 INT DEFAULT 0,
          failure_37 INT DEFAULT 0,
          failure_38 INT DEFAULT 0,
          failure_39 INT DEFAULT 0,
          failure_40 INT DEFAULT 0,
          failure_41 INT DEFAULT 0,
          PRIMARY KEY (rid),
          FOREIGN KEY (rid) REFERENCES Reports(rid),
          FOREIGN KEY (mid) REFERENCES Machines(mid)
      );`;

      const createCoinMechDataTable = `
      CREATE TABLE IF NOT EXISTS CoinMechData (
          rid INT NOT NULL,
          mid INT NOT NULL,
          coin_1 INT DEFAULT 0,
          coin_2 INT DEFAULT 0,
          coin_3 INT DEFAULT 0,
          coin_4 INT DEFAULT 0,
          coin_5 INT DEFAULT 0,
          coin_6 INT DEFAULT 0,
          total_cash INT DEFAULT 0,
          total_sales INT DEFAULT 0,
          total_cash_credit INT DEFAULT 0,
          PRIMARY KEY (rid),
          FOREIGN KEY (rid) REFERENCES Reports(rid),
          FOREIGN KEY (mid) REFERENCES Machines(mid)
      );`;

      // Execute queries sequentially
    conn.query(createReportsTable, (err) => {
      if (err) return reject(err);
      conn.query(createSelectionsTable, (err) => {
        if (err) return reject(err);
        conn.query(createPriceBandsTable, (err) => {
          if (err) return reject(err);
          conn.query(createFailuresTable, (err) => {
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
};


dataPool.insertReport = (reportData) => {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO Reports (mid, total_count, total_sel_norm, total_sel_maint, total_sel_total) VALUES (?, ?, ?, ?, ?)`;
      conn.query(query, [reportData.mid, reportData.total_count, reportData.total_sel_norm, reportData.total_sel_maint, reportData.total_sel_total], (err, res) => {
          if (err) return reject(err);
          resolve(res);
      });
  });
};

dataPool.insertSelections = (rid, selections) => {
  return new Promise((resolve, reject) => {
      const columns = selections.map((_, idx) => `sel_${idx + 1}`).join(', ');
      const values = selections.map(() => '?').join(', ');
      const query = `INSERT INTO Selections (rid, ${columns}) VALUES (${rid}, ${values})`;
      conn.query(query, [rid, ...selections], (err, res) => {
          if (err) return reject(err);
          resolve(res);
      });
  });
};

dataPool.insertPriceBands = (rid, priceBands) => {
  return new Promise((resolve, reject) => {
      const columns = priceBands.map((_, idx) => `band_${idx + 1}`).join(', ');
      const values = priceBands.map(() => '?').join(', ');
      const query = `INSERT INTO PriceBands (rid, ${columns}) VALUES (${rid}, ${values})`;
      conn.query(query, [rid, ...priceBands], (err, res) => {
          if (err) return reject(err);
          resolve(res);
      });
  });
};

dataPool.insertFailures = (rid, failures) => {
  return new Promise((resolve, reject) => {
      const columns = failures.map((_, idx) => `fail_${idx + 1}`).join(', ');
      const values = failures.map(() => '?').join(', ');
      const query = `INSERT INTO Failures (rid, ${columns}) VALUES (${rid}, ${values})`;
      conn.query(query, [rid, ...failures], (err, res) => {
          if (err) return reject(err);
          resolve(res);
      });
  });
};

dataPool.insertCoinMechData = (rid, coinMechData) => {
  return new Promise((resolve, reject) => {
      const columns = Object.keys(coinMechData).join(', ');
      const values = Object.values(coinMechData).map(() => '?').join(', ');
      const query = `INSERT INTO CoinMechData (rid, ${columns}) VALUES (${rid}, ${values})`;
      conn.query(query, [rid, ...Object.values(coinMechData)], (err, res) => {
          if (err) return reject(err);
          resolve(res);
      });
  });
};


module.exports = dataPool;

