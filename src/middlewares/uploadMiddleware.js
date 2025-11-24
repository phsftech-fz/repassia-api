const multer = require('multer');
const config = require('../config/env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Tipos permitidos: ${config.upload.allowedFileTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter
});

const uploadMultiple = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Arquivo muito grande. Tamanho máximo: ${config.upload.maxFileSize / 1024 / 1024}MB`
          }
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Máximo de 10 imagens por upload'
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message
        }
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    next();
  });
};

module.exports = {
  uploadMultiple
};

