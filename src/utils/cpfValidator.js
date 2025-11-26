/**
 * Validador de CPF brasileiro
 * Implementa o algoritmo de validação de CPF
 */

function validateCPF(cpf) {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se são todos dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

function formatCPF(cpf) {
  if (!cpf) return '';
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return cleanCPF;
  return `${cleanCPF.substring(0, 3)}.${cleanCPF.substring(3, 6)}.${cleanCPF.substring(6, 9)}-${cleanCPF.substring(9)}`;
}

function sanitizeCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

module.exports = {
  validateCPF,
  formatCPF,
  sanitizeCPF
};

