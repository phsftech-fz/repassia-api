/**
 * Utilitários para sanitização de dados
 */

function sanitizeCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

function sanitizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

function sanitizeZipCode(zipCode) {
  if (!zipCode) return '';
  return zipCode.replace(/\D/g, '');
}

function sanitizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

function sanitizeName(name) {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

function sanitizeState(state) {
  if (!state) return '';
  return state.trim().toUpperCase();
}

function sanitizeRG(rg) {
  if (!rg) return '';
  return rg.replace(/\D/g, '');
}

function sanitizeFormData(data) {
  const sanitized = { ...data };

  // Sanitizar dados pessoais
  if (sanitized.personalData) {
    sanitized.personalData = {
      ...sanitized.personalData, // Preservar todos os campos originais
      cpf: sanitizeCPF(sanitized.personalData.cpf),
      phone: sanitizePhone(sanitized.personalData.phone),
      email: sanitizeEmail(sanitized.personalData.email),
      fullName: sanitizeName(sanitized.personalData.fullName),
      motherName: sanitizeName(sanitized.personalData.motherName),
      fatherName: sanitized.personalData.fatherName ? sanitizeName(sanitized.personalData.fatherName) : null,
      birthState: sanitized.personalData.birthState ? sanitizeState(sanitized.personalData.birthState) : null,
      rg: sanitized.personalData.rg ? sanitizeRG(sanitized.personalData.rg) : null,
      // Preservar campos que não precisam sanitização
      birthDate: sanitized.personalData.birthDate, // Preservar birthDate
      birthCity: sanitized.personalData.birthCity, // Preservar birthCity
      maritalStatus: sanitized.personalData.maritalStatus, // Preservar maritalStatus
      hasDriverLicense: sanitized.personalData.hasDriverLicense, // Preservar hasDriverLicense
      driverLicenseCategory: sanitized.personalData.driverLicenseCategory // Preservar driverLicenseCategory
    };
  }

  // Sanitizar dados residenciais
  if (sanitized.residentialData) {
    sanitized.residentialData = {
      ...sanitized.residentialData,
      zipCode: sanitizeZipCode(sanitized.residentialData.zipCode),
      street: sanitizeName(sanitized.residentialData.street),
      neighborhood: sanitizeName(sanitized.residentialData.neighborhood),
      city: sanitizeName(sanitized.residentialData.city),
      state: sanitized.residentialData.state ? sanitizeState(sanitized.residentialData.state) : null,
      complement: sanitized.residentialData.complement ? sanitizeName(sanitized.residentialData.complement) : null
    };
  }

  // Sanitizar dados profissionais
  if (sanitized.professionalData) {
    sanitized.professionalData = {
      ...sanitized.professionalData,
      companyZipCode: sanitized.professionalData.companyZipCode ? sanitizeZipCode(sanitized.professionalData.companyZipCode) : null,
      companyPhone: sanitized.professionalData.companyPhone ? sanitizePhone(sanitized.professionalData.companyPhone) : null,
      companyStreet: sanitized.professionalData.companyStreet ? sanitizeName(sanitized.professionalData.companyStreet) : null,
      companyNeighborhood: sanitized.professionalData.companyNeighborhood ? sanitizeName(sanitized.professionalData.companyNeighborhood) : null,
      companyCity: sanitized.professionalData.companyCity ? sanitizeName(sanitized.professionalData.companyCity) : null,
      companyState: sanitized.professionalData.companyState ? sanitizeState(sanitized.professionalData.companyState) : null,
      companyName: sanitized.professionalData.companyName ? sanitizeName(sanitized.professionalData.companyName) : null,
      position: sanitized.professionalData.position ? sanitizeName(sanitized.professionalData.position) : null
    };
  }

  // Sanitizar referências
  if (sanitized.references) {
    sanitized.references = {
      ...sanitized.references,
      name: sanitized.references.name ? sanitizeName(sanitized.references.name) : null,
      phone: sanitized.references.phone ? sanitizePhone(sanitized.references.phone) : null
    };
  }

  return sanitized;
}

module.exports = {
  sanitizeCPF,
  sanitizePhone,
  sanitizeZipCode,
  sanitizeEmail,
  sanitizeName,
  sanitizeState,
  sanitizeRG,
  sanitizeFormData
};

