const { ApiError } = require('../utils/errors');

module.exports = function multerErrors(err, req, res, next) {
  if (err && (err.name === 'MulterError' || /file/i.test(err.message))) {
    return next(new ApiError(400, 'FILE_UPLOAD_ERROR', err.message));
  }
  next(err);
};