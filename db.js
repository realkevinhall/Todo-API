// Load all modules into sequelize and return info to server.js
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

var sequelize;
var bcrypt = require('bcrypt');

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    'dialect': 'postgres'
  });
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
  });
}

var db = {};

db.todo = sequelize.import(__dirname + '/model/todo.js');
db.user = sequelize.import(__dirname + '/model/user.js');
db.token = sequelize.import(__dirname + '/model/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user.prototype.toPublicJSON = function () {
 var json = this.toJSON();
 return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
};

db.user.prototype.generateToken = function (type) {
  if (!_.isString(type)) {
    return undefined;
  }
  try {
    var stringData = JSON.stringify({id: this.get('id'), type: type});
    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
    var token = jwt.sign({
      token: encryptedData
    }, 'qwerty098');
    return token;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

db.user.authenticate = function (body) {
  return new Promise(function (resolve, reject) {
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return reject();
    }
    db.user.findOne({
      where: {
        email: body.email
      }
    }).then(function (user) {
      if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
        return reject(); // Authentication is possible but it failed
      }
      resolve(user);
    }, function (e) {
      reject();
    });  
  });   
}

db.user.findByToken = function (token) {
  return new Promise(function (resolve, reject) {
    try {
      var decodedJWT = jwt.verify(token, 'qwerty098');
      var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#');
      var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
      db.user.findById(tokenData.id).then(function (user) {
        if (user) {
          resolve(user);
        } else {
          reject;
        }
      }, function (e) {
        reject();
      });
    } catch (e) {
      reject();
    }
  });
}
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;