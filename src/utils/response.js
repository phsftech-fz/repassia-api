const success = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

const successWithMeta = (res, data, meta, message = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    ...(message && { message })
  });
};

const error = (res, message, code = 'ERROR', details = null, statusCode = 400) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  successWithMeta,
  error
};

