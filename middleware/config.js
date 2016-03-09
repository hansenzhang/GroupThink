var auth = require('./auth.json')
var node_env = process.env.NODE_ENV || 'development';
var auth_env = auth[node_env];

module.exports = {
  'auth_env' : auth_env
};
