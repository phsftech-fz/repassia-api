const { startScheduler, stopScheduler } = require('./carCleanupScheduler');

const startSchedulers = () => {
  startScheduler();
};

const stopSchedulers = () => {
  stopScheduler();
};

module.exports = {
  startSchedulers,
  stopSchedulers
};

