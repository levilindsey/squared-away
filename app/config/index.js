var config = {
  local: {
    mode: 'local',
    port: 3000,
    mongo: {
      host: '127.0.0.1',
      port: '27017'
    },
    nodejitsu: false
  },
  staging: {
    mode: 'staging',
    port: 4000,
    mongo: {
      host: '127.0.0.1',
      port: '27017'
    },
    nodejitsu: true
  },
  production: {
    mode: 'production',
    port: 5000,
    mongo: {
      host: '127.0.0.1',
      port: '27017'
    },
    nodejitsu: true
  }
}

module.exports = function setMode(mode) {
  return config[mode || process.argv[2] || 'local'];
}
