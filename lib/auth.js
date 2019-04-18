const isAuthorised = id => id == +process.env.TELEGRAM_USER;

module.exports = {
  isAuthorised,
};
