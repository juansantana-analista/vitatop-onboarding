// Configuration file for the onboarding system
const OnboardingConfig = {
    // API endpoints
    endpoints: {
        validateDocument: 'verificar_documento.php',
        validateEmail: 'verificar_email.php',
        register: 'ajax_handler.php',
        viaCep: 'https://viacep.com.br/ws/'
    },
    
    // Validation settings
    validation: {
        minPasswordLength: 8,
        documentTypes: {
            F: 'CPF',
            J: 'CNPJ'
        }
    },
    
    // UI settings
    ui: {
        loadingMessages: {
            validating: 'Validando...',
            registering: 'Cadastrando...',
            searchingAddress: 'Buscando endereço...'
        },
        successMessages: {
            addressFound: 'Endereço encontrado!',
            registrationSuccess: 'Cadastro realizado com sucesso!'
        },
        errorMessages: {
            requiredField: 'Este campo é obrigatório',
            invalidEmail: 'E-mail inválido',
            invalidCPF: 'CPF inválido',
            invalidCNPJ: 'CNPJ inválido',
            cpfExists: 'Este CPF já está cadastrado',
            cnpjExists: 'Este CNPJ já está cadastrado',
            emailExists: 'Este e-mail já está cadastrado',
            shortPassword: 'Senha deve ter no mínimo 8 caracteres',
            cepNotFound: 'CEP não encontrado',
            cepError: 'Erro ao buscar CEP',
            registrationError: 'Erro ao realizar cadastro. Tente novamente.',
            validationError: 'Por favor, corrija os erros antes de continuar'
        }
    },
    
    // Form masks
    masks: {
        cpf: '000.000.000-00',
        cnpj: '00.000.000/0000-00',
        phone: '(00) 00000-0000',
        cep: '00000-000'
    },
    
    // Company info
    company: {
        name: 'VitaTop',
        logo: 'img/logo.png',
        subtitle: 'Seja nosso distribuidor independente VitaTop',
        successRedirect: 'sucesso.php',
        appUrl: 'https://vitatop.tecskill.com.br/'
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingConfig;
}