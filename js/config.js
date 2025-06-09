// Enhanced configuration for VitaTop onboarding system
const OnboardingConfig = {
    // API endpoints
    endpoints: {
        validateDocument: 'verificar_documento.php',
        validateEmail: 'verificar_email.php',
        validateEnhanced: 'verificar_documento_enhanced.php', // New enhanced validation
        register: 'ajax_handler.php',
        viaCep: 'https://viacep.com.br/ws/',
        combos: 'buscar_combos.php',
        payment: 'ajax_handler.php'
    },
    
    // Validation settings
    validation: {
        minPasswordLength: 8,
        maxPasswordLength: 50,
        documentTypes: {
            F: 'CPF',
            J: 'CNPJ'
        },
        passwordRequirements: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false // Optional but recommended
        },
        phone: {
            minLength: 10,
            maxLength: 11,
            validAreaCodes: [
                '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
                '21', '22', '24', // RJ
                '27', '28', // ES
                '31', '32', '33', '34', '35', '37', '38', // MG
                '41', '42', '43', '44', '45', '46', // PR
                '47', '48', '49', // SC
                '51', '53', '54', '55', // RS
                '61', // DF
                '62', '64', // GO
                '63', // TO
                '65', '66', // MT
                '67', // MS
                '68', // AC
                '69', // RO
                '71', '73', '74', '75', '77', // BA
                '79', // SE
                '81', '87', // PE
                '82', // AL
                '83', // PB
                '84', // RN
                '85', '88', // CE
                '86', '89', // PI
                '91', '93', '94', // PA
                '92', '97', // AM
                '95', // RR
                '96', // AP
                '98', '99' // MA
            ]
        },
        rateLimit: {
            maxAttempts: 10,
            windowMinutes: 1
        }
    },
    
    // UI settings
    ui: {
        loadingMessages: {
            validating: 'Validando...',
            registering: 'Cadastrando...',
            searchingAddress: 'Buscando endereço...',
            loadingCombos: 'Carregando combos...',
            processingPayment: 'Processando pagamento...',
            checkingAvailability: 'Verificando disponibilidade...'
        },
        successMessages: {
            addressFound: 'Endereço encontrado automaticamente!',
            registrationSuccess: 'Cadastro realizado com sucesso!',
            paymentSuccess: 'Pagamento processado com sucesso!',
            documentAvailable: 'Documento disponível para cadastro',
            emailAvailable: 'E-mail disponível para cadastro',
            validPassword: 'Senha forte criada!',
            comboSelected: 'Combo selecionado com sucesso!'
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
            weakPassword: 'Senha muito fraca. Tente uma combinação mais forte.',
            cepNotFound: 'CEP não encontrado',
            cepError: 'Erro ao buscar CEP',
            phoneInvalid: 'Telefone inválido',
            registrationError: 'Erro ao realizar cadastro. Tente novamente.',
            validationError: 'Por favor, corrija os erros antes de continuar',
            combosError: 'Erro ao carregar combos disponíveis',
            paymentError: 'Erro ao processar pagamento. Tente novamente.',
            invalidCard: 'Dados do cartão inválidos',
            invalidExpiry: 'Data de validade inválida',
            invalidCVV: 'CVV inválido',
            sessionExpired: 'Sessão expirada. Recarregue a página.',
            networkError: 'Erro de conexão. Verifique sua internet.',
            rateLimited: 'Muitas tentativas. Aguarde um momento.',
            serverError: 'Erro no servidor. Tente novamente em instantes.'
        },
        pnlMessages: {
            combo: {
                title: '🎯 Transforme sua vida financeira AGORA!',
                subtitle: 'Esta é sua oportunidade única de começar com tudo que precisa',
                benefits: [
                    '💰 Potencial de ganhos ilimitados desde o primeiro dia',
                    '🚀 Kit completo para acelerar seus resultados',
                    '🎯 Estratégias comprovadas que já mudaram milhares de vidas',
                    '⏰ Oferta especial por tempo limitado',
                    '🏆 Suporte premium 24/7',
                    '📈 Material de treinamento exclusivo'
                ],
                urgency: 'Apenas hoje com desconto especial!',
                social_proof: 'Mais de 10.000 pessoas já transformaram suas vidas com nossos combos',
                scarcity: 'Restam apenas algumas vagas hoje!',
                confirmation: {
                    title: 'Atenção! Oportunidade Única',
                    message: 'Você está prestes a perder uma oportunidade exclusiva de acelerar seus resultados como distribuidor VitaTop!',
                    urgency: 'Esta oferta expira em poucos minutos!',
                    benefits_lost: [
                        'Ganhos até 300% maiores no primeiro mês',
                        'Suporte premium 24/7',
                        'Estratégias exclusivas de vendas',
                        'Material de treinamento avançado'
                    ],
                    buttons: {
                        goBack: 'Sim! Quero ver os combos e acelerar meus resultados',
                        continue: 'Não, prefiro começar sem vantagens'
                    }
                }
            }
        },
        toasts: {
            duration: 3000,
            errorDuration: 4000,
            position: 'top-right' // top-right, top-left, bottom-right, bottom-left
        }
    },
    
    // Form masks and formatting
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
                badge: '5% OFF',
                enabled: true
            },
            card: {
                name: 'Cartão de Crédito',
                icon: 'fas fa-credit-card',
                description: 'Parcelamento em até 12x',
                maxInstallments: 12,
                minInstallmentValue: 10,
                enabled: true
            },
            boleto: {
                name: 'Boleto Bancário',
                icon: 'fas fa-barcode',
                description: 'Vencimento em 3 dias úteis',
                days: 3,
                enabled: true
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
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                clickable: true,
                dynamicBullets: true
            },
            navigation: true,
            loop: true,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            }
        },
        defaultFeatures: [
            'Kit de produtos premium',
            'Material de treinamento exclusivo',
            'Suporte especializado',
            'Estratégias de vendas comprovadas',
            'Acesso à comunidade VIP'
        ],
        loadTimeout: 10000, // 10 seconds
        retryAttempts: 3
    },
    
    // Animation settings
    animations: {
        transitionDuration: 300,
        confetti: {
            count: 60,
            colors: ['#7cbe42', '#00591f', '#10b981', '#f59e0b', '#3b82f6'],
            duration: 3000,
            spread: 60,
            startVelocity: 45
        },
        stepTransition: {
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        loadingSpinner: {
            speed: '1s'
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
        supportPhone: '(11) 99999-9999',
        socialMedia: {
            facebook: 'https://facebook.com/vitatop',
            instagram: 'https://instagram.com/vitatop',
            youtube: 'https://youtube.com/vitatop'
        }
    },
    
    // Security settings
    security: {
        enableCSRF: true,
        sessionTimeout: 30, // minutes
        maxLoginAttempts: 5,
        lockoutDuration: 15, // minutes
        passwordHistory: 3 // remember last 3 passwords
    },
    
    // Performance settings
    performance: {
        enableLazyLoading: true,
        preloadCriticalImages: true,
        deferNonCriticalJS: true,
        enableServiceWorker: false, // Set to true when SW is implemented
        cacheTimeout: 300000 // 5 minutes
    },
    
    // Debug settings
    debug: {
        enabled: false,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        enableConsoleWarnings: true,
        trackUserInteractions: false,
        enablePerformanceMonitoring: false
    },
    
    // Feature flags
    features: {
        enableComboStep: true,
        enablePaymentStep: true,
        enableAddressValidation: true,
        enableDocumentValidation: true,
        enableEmailValidation: true,
        enablePhoneValidation: true,
        enablePasswordStrengthMeter: true,
        enableConfetti: true,
        enableAutoComplete: true,
        enableOfflineMode: false,
        enablePWAFeatures: false,
        enableAnalytics: false,
        enableChatSupport: false,
        enableMultiLanguage: false
    },
    
    // Accessibility settings
    accessibility: {
        enableHighContrast: false,
        enableLargeText: false,
        enableReducedMotion: false,
        enableScreenReaderSupport: true,
        enableKeyboardNavigation: true
    },
    
    // Mobile settings
    mobile: {
        enableTouchGestures: true,
        swipeThreshold: 50,
        enableVibration: false,
        optimizeForTouch: true
    }
};

// Utility functions
OnboardingConfig.utils = {
    // Price formatting
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
    
    // Document formatting
    formatCPF: (cpf) => {
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    formatCNPJ: (cnpj) => {
        const cleaned = cnpj.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    formatCEP: (cep) => {
        const cleaned = cep.replace(/\D/g, '');
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    },
    
    // Data cleaning
    cleanDocument: (doc) => {
        return doc.replace(/\D/g, '');
    },
    
    cleanPhone: (phone) => {
        return phone.replace(/\D/g, '');
    },
    
    cleanCEP: (cep) => {
        return cep.replace(/\D/g, '');
    },
    
    // Validation helpers
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validateCPF: (cpf) => {
        const cleaned = cpf.replace(/\D/g, '');
        
        if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
            return false;
        }
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cleaned.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cleaned.charAt(10))) return false;
        
        return true;
    },
    
    validateCNPJ: (cnpj) => {
        const cleaned = cnpj.replace(/\D/g, '');
        
        if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) {
            return false;
        }
        
        let sum = 0;
        let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleaned.charAt(i)) * weights[i];
        }
        
        let digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cleaned.charAt(12))) return false;
        
        sum = 0;
        weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleaned.charAt(i)) * weights[i];
        }
        
        digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cleaned.charAt(13))) return false;
        
        return true;
    },
    
    // Password strength calculator
    calculatePasswordStrength: (password) => {
        let score = 0;
        const feedback = [];
        const requirements = [];
        
        // Length check
        if (password.length >= 8) {
            score += 25;
            requirements.push({ text: '8+ caracteres', met: true });
        } else {
            requirements.push({ text: '8+ caracteres', met: false });
            feedback.push('Use pelo menos 8 caracteres');
        }
        
        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 25;
            requirements.push({ text: 'Letra minúscula', met: true });
        } else {
            requirements.push({ text: 'Letra minúscula', met: false });
            feedback.push('Inclua uma letra minúscula');
        }
        
        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 25;
            requirements.push({ text: 'Letra maiúscula', met: true });
        } else {
            requirements.push({ text: 'Letra maiúscula', met: false });
            feedback.push('Inclua uma letra maiúscula');
        }
        
        // Number check
        if (/\d/.test(password)) {
            score += 25;
            requirements.push({ text: 'Número', met: true });
        } else {
            requirements.push({ text: 'Número', met: false });
            feedback.push('Inclua um número');
        }
        
        // Special characters bonus
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 10;
            requirements.push({ text: 'Caractere especial (bônus)', met: true });
        }
        
        // Common passwords penalty
        const commonPasswords = [
            '12345678', 'password', '123456789', 'qwerty', 'abc123',
            'senha123', 'admin123', '12341234', 'password123'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            score = Math.max(0, score - 50);
            feedback.push('Evite senhas muito comuns');
        }
        
        // Determine strength level
        let level = 'very-weak';
        let text = 'Muito fraca';
        let color = '#ef4444';
        
        if (score >= 85) {
            level = 'strong';
            text = 'Forte';
            color = '#10b981';
        } else if (score >= 70) {
            level = 'good';
            text = 'Boa';
            color = '#3b82f6';
        } else if (score >= 50) {
            level = 'fair';
            text = 'Regular';
            color = '#f59e0b';
        } else if (score >= 25) {
            level = 'weak';
            text = 'Fraca';
            color = '#ef4444';
        }
        
        return {
            score,
            level,
            text,
            color,
            valid: score >= 70,
            requirements,
            feedback
        };
    },
    
    // Utility functions
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    // Storage helpers (with fallback for environments without localStorage)
    setItem: (key, value) => {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (e) {
            console.warn('Storage not available:', e);
        }
    },
    
    getItem: (key, defaultValue = null) => {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            }
        } catch (e) {
            console.warn('Storage not available:', e);
        }
        return defaultValue;
    },
    
    removeItem: (key) => {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn('Storage not available:', e);
        }
    },
    
    // Date utilities
    formatDate: (date, format = 'dd/mm/yyyy') => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            default:
                return date.toLocaleDateString('pt-BR');
        }
    },
    
    // Network utilities
    checkConnection: () => {
        return navigator.onLine;
    },
    
    // Device detection
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isTablet: () => {
        return /iPad|Android|Tablet/i.test(navigator.userAgent) && window.innerWidth >= 768;
    },
    
    // Performance utilities
    measurePerformance: (name, fn) => {
        if (OnboardingConfig.debug.enablePerformanceMonitoring) {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        }
        return fn();
    },
    
    // Logging utilities
    log: (level, message, data = null) => {
        if (!OnboardingConfig.debug.enabled) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(OnboardingConfig.debug.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            switch (level) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data);
                    break;
                case 'debug':
                    console.debug(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
        }
    },
    
    // Analytics helpers (placeholder for future implementation)
    track: (event, properties = {}) => {
        if (OnboardingConfig.features.enableAnalytics) {
            // Implementation would go here
            OnboardingConfig.utils.log('info', `Track event: ${event}`, properties);
        }
    },
    
    // Error reporting
    reportError: (error, context = {}) => {
        OnboardingConfig.utils.log('error', 'Error reported', { error, context });
        
        // Could send to error reporting service here
        if (OnboardingConfig.debug.enabled) {
            console.error('Error reported:', error, context);
        }
    },
    
    // URL utilities
    getQueryParam: (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    setQueryParam: (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    // Cookie utilities (simple implementation)
    setCookie: (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    getCookie: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
};

// Initialize configuration based on environment
OnboardingConfig.init = () => {
    // Detect if running in development
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('dev') ||
                         window.location.search.includes('debug=true');
    
    if (isDevelopment) {
        OnboardingConfig.debug.enabled = true;
        OnboardingConfig.debug.logLevel = 'debug';
        OnboardingConfig.debug.enableConsoleWarnings = true;
    }
    
    // Check for reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        OnboardingConfig.accessibility.enableReducedMotion = true;
        OnboardingConfig.animations.transitionDuration = 0;
        OnboardingConfig.combo.swiper.autoplay = false;
    }
    
    // Check for high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        OnboardingConfig.accessibility.enableHighContrast = true;
    }
    
    // Mobile optimizations
    if (OnboardingConfig.utils.isMobile()) {
        OnboardingConfig.mobile.optimizeForTouch = true;
        OnboardingConfig.combo.swiper.spaceBetween = 15;
        OnboardingConfig.animations.transitionDuration = 200;
    }
    
    // Log initialization
    OnboardingConfig.utils.log('info', 'OnboardingConfig initialized', {
        environment: isDevelopment ? 'development' : 'production',
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        features: OnboardingConfig.features
    });
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', OnboardingConfig.init);
} else {
    OnboardingConfig.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingConfig;
}

// Make it globally available
window.OnboardingConfig = OnboardingConfig;