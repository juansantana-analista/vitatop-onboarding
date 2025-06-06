// Configuration file for the onboarding system
const OnboardingConfig = {
    // API endpoints
    endpoints: {
        validateDocument: 'verificar_documento.php',
        validateEmail: 'verificar_email.php',
        register: 'ajax_handler.php',
        viaCep: 'https://viacep.com.br/ws/',
        combos: 'buscar_combos.php',
        payment: 'ajax_handler.php'
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
            searchingAddress: 'Buscando endereço...',
            loadingCombos: 'Carregando combos...',
            processingPayment: 'Processando pagamento...'
        },
        successMessages: {
            addressFound: 'Endereço encontrado!',
            registrationSuccess: 'Cadastro realizado com sucesso!',
            paymentSuccess: 'Pagamento processado com sucesso!'
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
            validationError: 'Por favor, corrija os erros antes de continuar',
            combosError: 'Erro ao carregar combos disponíveis',
            paymentError: 'Erro ao processar pagamento. Tente novamente.',
            invalidCard: 'Dados do cartão inválidos',
            invalidExpiry: 'Data de validade inválida',
            invalidCVV: 'CVV inválido'
        },
        pnlMessages: {
            combo: {
                title: '🎯 Transforme sua vida financeira AGORA!',
                subtitle: 'Esta é sua oportunidade única de começar com tudo que precisa',
                benefits: [
                    '💰 Potencial de ganhos ilimitados desde o primeiro dia',
                    '🚀 Kit completo para acelerar seus resultados',
                    '🎯 Estratégias comprovadas que já mudaram milhares de vidas',
                    '⏰ Oferta especial por tempo limitado'
                ],
                urgency: 'Apenas hoje com desconto especial!',
                social_proof: 'Mais de 10.000 pessoas já transformaram suas vidas com nossos combos',
                confirmation: {
                    title: 'Tem certeza?',
                    message: 'Você está perdendo a oportunidade de acelerar seus resultados com nossos combos especiais. Milhares de pessoas já transformaram suas vidas com eles!',
                    buttons: {
                        goBack: 'Ver Combos',
                        continue: 'Continuar sem combo'
                    }
                }
            }
        }
    },
    
    // Form masks
    masks: {
        cpf: '000.000.000-00',
        cnpj: '00.000.000/0000-00',
        phone: '(00) 00000-0000',
        cep: '00000-000',
        card: '0000 0000 0000 0000',
        expiry: 'MM/AA',
        cvv: '000'
    },
    
    // Payment settings
    payment: {
        methods: {
            pix: {
                name: 'PIX',
                icon: 'fas fa-qrcode',
                description: 'Pagamento instantâneo',
                discount: 5,
                badge: '5% OFF'
            },
            card: {
                name: 'Cartão de Crédito',
                icon: 'fas fa-credit-card',
                description: 'Parcelamento em até 12x',
                maxInstallments: 12,
                minInstallmentValue: 10
            },
            boleto: {
                name: 'Boleto Bancário',
                icon: 'fas fa-barcode',
                description: 'Vencimento em 3 dias úteis',
                days: 3
            }
        },
        validation: {
            cardNumber: {
                minLength: 13,
                maxLength: 19
            },
            cvv: {
                minLength: 3,
                maxLength: 4
            },
            expiry: {
                format: 'MM/YY'
            }
        }
    },
    
    // Combo settings
    combo: {
        swiper: {
            slidesPerView: 1,
            spaceBetween: 20,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false
            },
            pagination: {
                clickable: true
            },
            navigation: true,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                }
            }
        },
        defaultFeatures: [
            'Kit de produtos premium',
            'Material de treinamento',
            'Suporte especializado',
            'Estratégias de vendas',
            'Acesso a comunidade VIP'
        ]
    },
    
    // Animation settings
    animations: {
        transitionDuration: 300,
        confetti: {
            count: 50,
            colors: ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#7cbe42'],
            duration: 3000
        },
        toast: {
            duration: 3000,
            errorDuration: 4000
        }
    },
    
    // Company info
    company: {
        name: 'VitaTop',
        logo: 'img/logo.png',
        subtitle: 'Seja nosso distribuidor independente VitaTop',
        successRedirect: 'sucesso.php',
        appUrl: 'https://appvitatop.tecskill.com.br/',
        supportEmail: 'suporte@vitatop.com.br',
        phone: '(11) 99999-9999'
    },
    
    // Debug settings
    debug: {
        enabled: false,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    },
    
    // Feature flags
    features: {
        enableComboStep: true,
        enablePaymentStep: true,
        enableAddressValidation: true,
        enableDocumentValidation: true,
        enableEmailValidation: true,
        enableConfetti: true,
        enableAutoComplete: true
    }
};

// Utility functions
OnboardingConfig.utils = {
    formatPrice: (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    },
    
    formatPriceNumber: (price) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    },
    
    cleanDocument: (doc) => {
        return doc.replace(/\D/g, '');
    },
    
    cleanPhone: (phone) => {
        return phone.replace(/\D/g, '');
    },
    
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    log: (level, message, data = null) => {
        if (!OnboardingConfig.debug.enabled) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(OnboardingConfig.debug.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            if (data) {
                console.log(logMessage, data);
            } else {
                console.log(logMessage);
            }
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingConfig;
}

// Make it globally available
window.OnboardingConfig = OnboardingConfig;