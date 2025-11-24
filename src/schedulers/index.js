const { startScheduler } = require('./carCleanupScheduler');

const startSchedulers = () => {
  startScheduler();
};

module.exports = {
  startSchedulers
};

