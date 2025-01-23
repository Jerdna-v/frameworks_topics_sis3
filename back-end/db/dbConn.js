const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, 
    database: 'Qcodeigniter',
  })

 conn.connect((err) => {
      if(err){
          console.log("ERROR: " + err.message);
          return;    
      }
      console.log('Connection established');
    })


    let dataPool={}
  
dataPool.allNovice=()=>{
  return new Promise ((resolve, reject)=>{
    conn.query(`SELECT * FROM news`, (err,res)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.oneNovica=(id)=>{
  return new Promise ((resolve, reject)=>{
    conn.query(`SELECT * FROM news WHERE id = ?`, id, (err,res)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.creteNovica=(title,slug,text,file)=>{
  return new Promise ((resolve, reject)=>{
    conn.query(`INSERT INTO news (title,slug,text, file) VALUES (?,?,?,?)`, [title, slug, text, file], (err,res)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.AuthUser=(username)=>
{
  return new Promise ((resolve, reject)=>{
    conn.query('SELECT * FROM user_login WHERE user_name = ?', username, (err,res, fields)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })  
	
}

dataPool.AddUser=(username,email,password)=>{
  return new Promise ((resolve, reject)=>{
    conn.query(`INSERT INTO user_login (user_name,user_email,user_password) VALUES (?,?,?)`, [username, email, password], (err,res)=>{
      if(err){return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM Users', (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

dataPool.AuthUser_ = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT username, phone_number, password FROM Users WHERE username = ?',
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

dataPool.addUser = (username, password, name, phoneNumber, startDate) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO Users (username, password, name, type, phone_number, start_date) VALUES (?,?,?,?,?,?)',
      [username, password, name, type, phoneNumber, startDate],
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
    const createMachinesTable = `
      CREATE TABLE IF NOT EXISTS Machines (
        mid INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        type VARCHAR(100),
        location VARCHAR(255),
        start_date DATE
      );
    `;
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS Users (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        password VARCHAR(255),
        name VARCHAR(100),
        type ENUM('owner', 'worker') DEFAULT 'worker',
        phone_number VARCHAR(15),
        start_date DATE
      );
    `;
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
    conn.query(
      createMachinesTable + createUsersTable + createNotificationsTable,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      }
    );
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
module.exports = dataPool;

