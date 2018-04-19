const dashboard = require('./dashboard');
const verifyEmail = require('./verifyEmail');

module.exports = {
  fetchTopUsageDataAndSendEmail: dashboard.fetchTopUsageDataAndSendEmail,
  verifyEmail: verifyEmail.handler,
};
