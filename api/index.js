const dashboard = require('./dashboard');
const verifyEmail = require('./verifyEmail');
const sendEmail = require('./sendEmail');

module.exports = {
  fetchTopUsageDataAndSendEmail: dashboard.fetchTopUsageDataAndSendEmail,
  verifyEmail: verifyEmail.handler,
  sendEmail: sendEmail.handler
};
