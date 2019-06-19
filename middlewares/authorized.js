module.exports = (req, res, next) => {
  if (!req.session.username) {
    return res.status(401).send('unauthorized');
  }
  return next();
};
