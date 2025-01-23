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


//
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

dataPool.addUser = (username, password, name, type, phoneNumber, startDate) => {
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

// 4. CRUD operations for Notifications
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

module.exports = dataPool;

