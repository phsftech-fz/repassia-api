function maskCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') return '***';
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return '***';
  return `***${cleanCPF.slice(-3)}`;
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  return `***@${parts[1]}`;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '***';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 4) return '***';
  return `***${cleanPhone.slice(-4)}`;
}

function maskRG(rg) {
  if (!rg || typeof rg !== 'string') return '***';
  const cleanRG = rg.replace(/\D/g, '');
  if (cleanRG.length < 3) return '***';
  return `***${cleanRG.slice(-3)}`;
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return '[Object muito profundo]';
  
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  const sensitiveFields = [
    'cpf', 'email', 'phone', 'rg', 'password', 'token', 
    'secret', 'key', 'authorization', 'creditCard', 'cvv',
    'motherName', 'fatherName', 'grossIncome', 'ipAddress'
  ];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      if (lowerKey.includes('cpf')) {
        sanitized[key] = maskCPF(value);
      } else if (lowerKey.includes('email')) {
        sanitized[key] = maskEmail(value);
      } else if (lowerKey.includes('phone')) {
        sanitized[key] = maskPhone(value);
      } else if (lowerKey.includes('rg')) {
        sanitized[key] = maskRG(value);
      } else if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('key')) {
        sanitized[key] = '***';
      } else {
        sanitized[key] = '***';
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeErrorMessage(message) {
  if (typeof message !== 'string') return message;
  
  message = message.replace(/\b\d{11}\b/g, '***');
  message = message.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, (email) => maskEmail(email));
  message = message.replace(/\b\d{10,11}\b/g, (phone) => maskPhone(phone));
  
  return message;
}

module.exports = {
  maskCPF,
  maskEmail,
  maskPhone,
  maskRG,
  sanitizeObject,
  sanitizeErrorMessage
};

