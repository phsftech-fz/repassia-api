const { success } = require('../utils/response');

class FormTypesController {
  async getFormTypes(req, res) {
    const formTypes = {
      maritalStatus: [
        { value: 'solteiro', label: 'Solteiro' },
        { value: 'casado', label: 'Casado' },
        { value: 'divorciado', label: 'Divorciado' },
        { value: 'viúvo', label: 'Viúvo' },
        { value: 'união estável', label: 'União Estável' }
      ],
      driverLicenseCategory: [
        { value: 'A', label: 'A - Motocicleta' },
        { value: 'B', label: 'B - Carro' },
        { value: 'AB', label: 'AB - Motocicleta e Carro' },
        { value: 'C', label: 'C - Veículo de Carga' },
        { value: 'D', label: 'D - Veículo de Passageiros' },
        { value: 'E', label: 'E - Veículo com Reboque' }
      ],
      residenceType: [
        { value: 'própria', label: 'Própria' },
        { value: 'alugada', label: 'Alugada' },
        { value: 'financiada', label: 'Financiada' },
        { value: 'cedida', label: 'Cedida' },
        { value: 'outros', label: 'Outros' }
      ],
      employmentType: [
        { value: 'assalariado', label: 'Assalariado' },
        { value: 'autônomo', label: 'Autônomo' },
        { value: 'aposentado', label: 'Aposentado' },
        { value: 'pensionista', label: 'Pensionista' },
        { value: 'empresário', label: 'Empresário' },
        { value: 'desempregado', label: 'Desempregado' }
      ],
      states: [
        { value: 'AC', label: 'Acre' },
        { value: 'AL', label: 'Alagoas' },
        { value: 'AP', label: 'Amapá' },
        { value: 'AM', label: 'Amazonas' },
        { value: 'BA', label: 'Bahia' },
        { value: 'CE', label: 'Ceará' },
        { value: 'DF', label: 'Distrito Federal' },
        { value: 'ES', label: 'Espírito Santo' },
        { value: 'GO', label: 'Goiás' },
        { value: 'MA', label: 'Maranhão' },
        { value: 'MT', label: 'Mato Grosso' },
        { value: 'MS', label: 'Mato Grosso do Sul' },
        { value: 'MG', label: 'Minas Gerais' },
        { value: 'PA', label: 'Pará' },
        { value: 'PB', label: 'Paraíba' },
        { value: 'PR', label: 'Paraná' },
        { value: 'PE', label: 'Pernambuco' },
        { value: 'PI', label: 'Piauí' },
        { value: 'RJ', label: 'Rio de Janeiro' },
        { value: 'RN', label: 'Rio Grande do Norte' },
        { value: 'RS', label: 'Rio Grande do Sul' },
        { value: 'RO', label: 'Rondônia' },
        { value: 'RR', label: 'Roraima' },
        { value: 'SC', label: 'Santa Catarina' },
        { value: 'SP', label: 'São Paulo' },
        { value: 'SE', label: 'Sergipe' },
        { value: 'TO', label: 'Tocantins' }
      ],
      employmentTypeRequiredFields: {
        assalariado: ['companyName', 'admissionDate', 'position', 'grossIncome'],
        autônomo: ['activityDescription', 'activityTime', 'grossIncome'],
        empresário: ['activityDescription', 'activityTime', 'grossIncome'],
        aposentado: ['activityTime', 'grossIncome'],
        pensionista: ['activityTime', 'grossIncome'],
        desempregado: []
      },
      validations: {
        minAge: 18,
        phoneLength: { min: 10, max: 11 },
        cpfLength: 11,
        zipCodeLength: 8,
        fullNameLength: { min: 3, max: 200 },
        emailMaxLength: 255,
        messageMaxLength: 500
      }
    };

    return success(res, formTypes, 200);
  }
}

module.exports = new FormTypesController();

