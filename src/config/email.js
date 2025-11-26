const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

// Criar transporter apenas se SMTP estiver configurado
let transporter = null;

if (config.smtp.host && config.smtp.user && config.smtp.password) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    }
  });

  // Verificar configuração do transporte (não bloqueante, com timeout)
  const verifyTimeout = setTimeout(() => {
    logger.warn('⚠️ Timeout ao verificar SMTP. Continuando sem verificação.');
  }, 5000);

  transporter.verify((error, success) => {
    clearTimeout(verifyTimeout);
    if (error) {
      logger.warn('⚠️ SMTP não configurado corretamente. Funcionalidade de email estará desabilitada.');
      logger.warn('⚠️ Configure SMTP_USER e SMTP_PASSWORD no .env para habilitar envio de emails.');
      if (config.server.nodeEnv === 'development') {
        logger.warn('⚠️ Detalhes do erro:', error.message);
      }
    } else {
      logger.info('✅ Configuração do SMTP verificada');
    }
  });
} else {
  logger.warn('⚠️ SMTP não configurado. Funcionalidade de email estará desabilitada.');
  logger.warn('⚠️ Configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD no .env para habilitar envio de emails.');
}

const sendAuthCodeEmail = async (email, name, code) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Código de Acesso - RepassIA</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Olá ${name},</h2>
        <p>Seu código de acesso é:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #2563eb; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          ${code}
        </h1>
        <p>Este código expira em ${config.auth.codeExpiration} minutos.</p>
        <p>Se você não solicitou este código, ignore este email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">RepassIA</p>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    throw new Error('SMTP não configurado');
  }

  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Código de Acesso - RepassIA',
      html
    });

    logger.info(`Email de código enviado com sucesso`);
    return true;
  } catch (error) {
    logger.error('Erro ao enviar email:', error.message || error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendAuthCodeEmail
};

