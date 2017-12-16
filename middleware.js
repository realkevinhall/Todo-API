module.exports = function (db) {
  return {
    requireAuthentication: function(req, res, next) {
      console.log('\n\n\n\nI try\n\n\n\n');
      var token = req.get('Auth');
      db.user.findByToken(token).then(function (user) {
        req.user = user;
        next();
      }, function (e) {
        console.log('\n\n\n\nbut I do not succeed\n\n\n\n');
        res.status(401).send();
      });
    }
  };
};