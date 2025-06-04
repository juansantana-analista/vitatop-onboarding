// Onboarding Logic com Validação Robusta
class OnboardingApp {
    constructor() {
        this.currentStep = 1;
        this.userData = {};
        this.personType = 'F'; // Default to Pessoa Física
        this.validationInProgress = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMasks();
        this.updateProgress();
    }
    
    setupEventListeners() {
        // Person type selection
        document.querySelectorAll('.person-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPersonType(e.currentTarget);
            });
        });
        
        // CEP lookup
        const cepInput = document.getElementById('cep');
        if (cepInput) {
            cepInput.addEventListener('blur', () => {
                this.lookupAddress();
            });
        }
        
        // Form validation on input with debounce for remote validation
        document.querySelectorAll('input[required], select[required]').forEach(input => {
            // Immediate validation for basic checks
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
            
            // Detailed validation on blur (including remote validation)
            input.addEventListener('blur', async () => {
                await this.validateField(input);
            });
        });
        
        // Enter key navigation
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.validationInProgress) {
                const activeStep = document.querySelector('.step.active');
                if (activeStep.id === 'step1') {
                    this.nextStep();
                } else if (activeStep.id === 'step2') {
                    this.finishRegistration();
                }
            }
        });
    }
    
    setupMasks() {
        // CPF/CNPJ mask
        const documentInput = document.getElementById('document');
        if (documentInput) {
            documentInput.addEventListener('input', () => {
                this.applyDocumentMask();
            });
        }
        
        // Phone mask
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.applyPhoneMask();
            });
        }
        
        // CEP mask
        const cepInput = document.getElementById('cep');
        if (cepInput) {
            cepInput.addEventListener('input', () => {
                this.applyCepMask();
            });
        }
    }
    
    selectPersonType(selectedOption) {
        // Remove active class from all options
        document.querySelectorAll('.person-type-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected option
        selectedOption.classList.add('active');
        
        // Update person type
        this.personType = selectedOption.dataset.type;
        
        // Update document field
        this.updateDocumentField();
        
        // Add animation
        selectedOption.style.transform = 'scale(0.95)';
        setTimeout(() => {
            selectedOption.style.transform = '';
        }, 150);
    }
    
    updateDocumentField() {
        const documentLabel = document.getElementById('documentLabel');
        const documentInput = document.getElementById('document');
        
        if (this.personType === 'J') {
            documentLabel.textContent = 'CNPJ *';
            documentInput.placeholder = OnboardingConfig.masks.cnpj;
        } else {
            documentLabel.textContent = 'CPF *';
            documentInput.placeholder = OnboardingConfig.masks.cpf;
        }
        
        // Clear current value and reapply mask
        documentInput.value = '';
        // Clear any existing validation errors
        this.clearFieldError(documentInput);
    }
    
    applyDocumentMask() {
        const input = document.getElementById('document');
        let value = input.value.replace(/\D/g, '');
        
        if (this.personType === 'J') {
            // CNPJ mask: 00.000.000/0000-00
            if (value.length <= 14) {
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
        } else {
            // CPF mask: 000.000.000-00
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            }
        }
        
        input.value = value;
    }
    
    applyPhoneMask() {
        const input = document.getElementById('phone');
        let value = input.value.replace(/\D/g, '');
        
        // Phone mask: (00) 00000-0000
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }
    
    applyCepMask() {
        const input = document.getElementById('cep');
        let value = input.value.replace(/\D/g, '');
        
        // CEP mask: 00000-000
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }
    
    async lookupAddress() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        const loading = document.getElementById('cepLoading');
        if (loading) loading.style.display = 'block';
        
        try {
            const response = await fetch(`${OnboardingConfig.endpoints.viaCep}${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                this.fillAddressFields(data);
                this.showSuccess(OnboardingConfig.ui.successMessages.addressFound);
            } else {
                this.showError(OnboardingConfig.ui.errorMessages.cepNotFound);
            }
        } catch (error) {
            this.showError(OnboardingConfig.ui.errorMessages.cepError);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }
    
    fillAddressFields(addressData) {
        document.getElementById('street').value = addressData.logradouro || '';
        document.getElementById('neighborhood').value = addressData.bairro || '';
        document.getElementById('city').value = addressData.localidade || '';
        document.getElementById('state').value = addressData.uf || '';
        
        // Focus on number field
        document.getElementById('number').focus();
    }
    
    clearFieldError(field) {
        const wrapper = field.closest('.input-wrapper') || field.closest('.form-group');
        const errorMessage = wrapper.querySelector('.error-message');
        
        wrapper.classList.remove('error');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    showFieldError(field, message) {
        const wrapper = field.closest('.input-wrapper') || field.closest('.form-group');
        
        // Clear existing error first
        this.clearFieldError(field);
        
        // Add error state
        wrapper.classList.add('error');
        
        // Create and append error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        wrapper.appendChild(errorDiv);
        
        // Scroll to error if needed
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Comprehensive field validation function
    async validateField(field) {
        if (this.validationInProgress && field.id !== 'document' && field.id !== 'email') {
            return true;
        }
        
        let isValid = true;
        let message = '';
        
        const fieldValue = field.value.trim();
        
        // Required field validation
        if (field.hasAttribute('required') && !fieldValue) {
            isValid = false;
            message = OnboardingConfig.ui.errorMessages.requiredField;
        }
        
        // If field is empty and not required, or if basic validation failed, return early
        if (!fieldValue || !isValid) {
            if (!isValid) {
                this.showFieldError(field, message);
            }
            return isValid;
        }
        
        // Email validation
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                isValid = false;
                message = OnboardingConfig.ui.errorMessages.invalidEmail;
            } else {
                // Remote email validation
                try {
                    this.validationInProgress = true;
                    const emailAvailable = await this.validateEmailRemote(fieldValue);
                    if (!emailAvailable) {
                        isValid = false;
                        message = OnboardingConfig.ui.errorMessages.emailExists;
                    }
                } catch (error) {
                    console.error('Erro na validação do email:', error);
                    isValid = false;
                    message = 'Erro ao validar email. Tente novamente.';
                } finally {
                    this.validationInProgress = false;
                }
            }
        }
        
        // Document validation
        if (field.id === 'document') {
            // Basic format validation
            if (!this.validateDocument(fieldValue)) {
                isValid = false;
                message = this.personType === 'J' ? 
                    OnboardingConfig.ui.errorMessages.invalidCNPJ : 
                    OnboardingConfig.ui.errorMessages.invalidCPF;
            } else {
                // Remote document validation
                try {
                    this.validationInProgress = true;
                    const docAvailable = await this.validateDocumentRemote(fieldValue, this.personType);
                    if (!docAvailable) {
                        isValid = false;
                        message = this.personType === 'J' ? 
                            OnboardingConfig.ui.errorMessages.cnpjExists : 
                            OnboardingConfig.ui.errorMessages.cpfExists;
                    }
                } catch (error) {
                    console.error('Erro na validação do documento:', error);
                    isValid = false;
                    message = 'Erro ao validar documento. Tente novamente.';
                } finally {
                    this.validationInProgress = false;
                }
            }
        }
        
        // Password validation
        if (field.id === 'password') {
            const minLength = OnboardingConfig.validation.minPasswordLength;
            if (fieldValue.length < minLength) {
                isValid = false;
                message = OnboardingConfig.ui.errorMessages.shortPassword;
            }
        }
        
        // Phone validation (basic)
        if (field.id === 'phone') {
            const phoneDigits = fieldValue.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                isValid = false;
                message = 'Telefone deve ter 10 ou 11 dígitos';
            }
        }
        
        // CEP validation
        if (field.id === 'cep') {
            const cepDigits = fieldValue.replace(/\D/g, '');
            if (cepDigits.length !== 8) {
                isValid = false;
                message = 'CEP deve ter 8 dígitos';
            }
        }
        
        // Name validation
        if (field.id === 'name') {
            if (fieldValue.length < 3) {
                isValid = false;
                message = 'Nome deve ter pelo menos 3 caracteres';
            } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(fieldValue)) {
                isValid = false;
                message = 'Nome deve conter apenas letras e espaços';
            }
        }
        
        // Show error if validation failed
        if (!isValid) {
            this.showFieldError(field, message);
        }
        
        return isValid;
    }
    
    validateDocument(doc) {
        const cleanDoc = doc.replace(/\D/g, '');
        
        if (this.personType === 'J') {
            return this.validateCNPJ(cleanDoc);
        } else {
            return this.validateCPF(cleanDoc);
        }
    }
    
    validateCPF(cpf) {
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }
    
    validateCNPJ(cnpj) {
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
        
        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;
        
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        
        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;
        
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        
        return true;
    }
    
    // Validate all fields in a step - CRITICAL VALIDATION
    async validateStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        const requiredFields = step.querySelectorAll('input[required], select[required]');
        let isValid = true;
        let errors = [];
        
        // Validate each field sequentially to avoid race conditions
        for (const field of requiredFields) {
            
            const fieldValid = await this.validateField(field);
            if (!fieldValid) {
                isValid = false;
                errors.push(`${field.id}: inválido`);
            }
        }
        
        // Additional validation for person type selection in step 1
        if (stepNumber === 1) {
            const activePersonType = document.querySelector('.person-type-option.active');
            if (!activePersonType) {
                isValid = false;
                errors.push('Tipo de pessoa não selecionado');
                this.showError('Selecione o tipo de cadastro');
            }
        }
        
        if (!isValid) {
            console.log('Erros encontrados:', errors);
        }
        
        return isValid;
    }
    
    async validateDocumentRemote(document, personType) {
        
        try {
            const formData = new FormData();
            const cleanDocument = document.replace(/\D/g, '');
            formData.append('documento', cleanDocument);
            formData.append('tipoPessoa', personType);
            
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            const response = await fetch(OnboardingConfig.endpoints.validateDocument, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.text();
            
            // INTERPRETAÇÃO CORRETA das respostas:
            // 'sucesso' = Documento DISPONÍVEL (NÃO existe no sistema) - PODE cadastrar
            // 'erro' = Documento JÁ CADASTRADO (existe no sistema) - NÃO pode cadastrar
            
            if (result.trim() === 'sucesso') {
                return true; // Permite cadastro
            } else if (result.trim() === 'erro') {
                return false; // Bloqueia cadastro
            } else {
                // Se a resposta for inesperada, bloquear por segurança
                return false;
            }
            
        } catch (error) {
            console.error('❌ ERRO na validação de documento:', error);
            throw error;
        }
    }
    
    async validateEmailRemote(email) {
        
        try {
            const formData = new FormData();
            formData.append('email', email);
            
            const response = await fetch(OnboardingConfig.endpoints.validateEmail, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.text();
            
            // Return true if email is available (can register)
            return result.trim() === 'sucesso';
        } catch (error) {
            console.error('Erro ao validar email:', error);
            throw error;
        }
    }
    
    async nextStep() {
        // Prevent multiple simultaneous validations
        if (this.validationInProgress) {
            return;
        }
        
        
        // Show loading on continue button while validating
        const continueBtn = document.querySelector('#step1 .btn-primary');
        const originalHtml = continueBtn.innerHTML;
        continueBtn.disabled = true;
        continueBtn.classList.add('loading');
        continueBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${OnboardingConfig.ui.loadingMessages?.validating || 'Validando...'}`;
        
        try {
            this.validationInProgress = true;
            
            // CRITICAL: Comprehensive validation of step 1
            const isValid = await this.validateStep(1);
            
            if (!isValid) {
                
                this.showError(OnboardingConfig.ui.errorMessages?.validationError || 'Por favor, corrija os erros antes de continuar');
                return;
            }
            
    
            
            // Save step 1 data
            this.userData = {
                personType: this.personType,
                name: document.getElementById('name').value.trim(),
                document: document.getElementById('document').value,
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            
            
            
            this.currentStep = 2;
            this.showStep(2);
            this.updateProgress();
            
            // Add transition effect
            this.addTransitionEffect();
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO na validação:', error);
            this.showError('Erro na validação. Tente novamente.');
        } finally {
            // Reset button state
            this.validationInProgress = false;
            continueBtn.disabled = false;
            continueBtn.classList.remove('loading');
            continueBtn.innerHTML = originalHtml;
        }
    }
    
    prevStep() {
        this.currentStep = 1;
        this.showStep(1);
        this.updateProgress();
        this.addTransitionEffect();
    }
    
    showStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            if (this.currentStep === 1) {
                progressFill.style.width = '50%';
                progressText.textContent = 'Etapa 1 de 2';
            } else if (this.currentStep === 2) {
                progressFill.style.width = '100%';
                progressText.textContent = 'Etapa 2 de 2';
            }
        }
    }
    
    addTransitionEffect() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.transform = 'scale(0.98)';
            setTimeout(() => {
                container.style.transform = '';
            }, 200);
        }
    }
    
    async finishRegistration() {
        // Prevent multiple simultaneous submissions
        if (this.validationInProgress) {
            
            return;
        }
        
        
        
        // Show loading state
        const submitButton = document.querySelector('#step2 .btn-primary');
        const originalHtml = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${OnboardingConfig.ui.loadingMessages?.registering || 'Finalizando cadastro...'}`;
        
        try {
            this.validationInProgress = true;
            
            // CRITICAL: Validate step 2
            const isValid = await this.validateStep(2);
            
            if (!isValid) {
                
                this.showError('Por favor, corrija os erros antes de finalizar');
                return;
            }
            
            
            
            // Save step 2 data
            this.userData.address = {
                cep: document.getElementById('cep').value,
                street: document.getElementById('street').value.trim(),
                number: document.getElementById('number').value.trim(),
                complement: document.getElementById('complement').value.trim(),
                neighborhood: document.getElementById('neighborhood').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim()
            };
            
            
            
            // FINAL VALIDATION BEFORE REGISTRATION
            
            if (!this.userData.name || !this.userData.email || !this.userData.document || 
                !this.userData.password || !this.userData.phone) {
                throw new Error('Dados obrigatórios faltando');
            }
            
            // Process registration
            await this.processRegistration();
            
            // Show success step
            this.showSuccessStep();
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO no cadastro:', error);
            this.showError(OnboardingConfig.ui.errorMessages?.registrationError || 'Erro ao finalizar cadastro. Tente novamente.');
        } finally {
            this.validationInProgress = false;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.innerHTML = originalHtml;
        }
    }
    
    async processRegistration() {
        
        
        try {
            // Prepare form data according to ajax_handler.php structure
            const formData = new FormData();
            
            // Add action identifier for AJAX handler
            formData.append('action', 'register');
            
            // Add all required fields
            formData.append('tipoPessoa', this.personType);
            formData.append('nomeAfiliado', this.userData.name);
            formData.append('razaoSocial', this.personType === 'J' ? this.userData.name : '');
            formData.append('dataNascimento', '');
            formData.append('genero', '');
            
            if (this.personType === 'F') {
                formData.append('CPF', this.userData.document.replace(/\D/g, ''));
                formData.append('RG', '');
                formData.append('CNPJ', '');
                formData.append('inscEstadual', '');
            } else {
                formData.append('CPF', '');
                formData.append('RG', '');
                formData.append('CNPJ', this.userData.document.replace(/\D/g, ''));
                formData.append('inscEstadual', '');
            }
            
            formData.append('email', this.userData.email);
            formData.append('senha', this.userData.password);
            formData.append('resenha', this.userData.password);
            formData.append('telefone', '');
            formData.append('celular', this.userData.phone.replace(/\D/g, ''));
            formData.append('cep', this.userData.address.cep.replace(/\D/g, ''));
            formData.append('endereco', this.userData.address.street);
            formData.append('numero', this.userData.address.number);
            formData.append('complemento', this.userData.address.complement);
            formData.append('bairro', this.userData.address.neighborhood);
            formData.append('cidade', this.userData.address.city);
            formData.append('estado', this.userData.address.state);
            
            console.log('Dados do FormData:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Submit to ajax_handler.php for JSON response
            const response = await fetch(OnboardingConfig.endpoints.register, {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parse JSON response
            let result;
            try {
                const responseText = await response.text();
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                throw new Error('Resposta inválida do servidor');
            }
            
            if (result.status === 'success') {
                this.registrationSuccess = true;
                this.successRedirect = result.redirect;
                return true;
            } else {
                console.log('❌ CADASTRO FALHOU:', result.message);
                throw new Error(result.message || 'Erro no cadastro');
            }
            
        } catch (error) {
            console.error('❌ ERRO no processamento do cadastro:', error);
            throw error;
        }
    }
    
    showSuccessStep() {
        // Hide progress bar
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        // Show success step
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        const successStep = document.getElementById('successStep');
        if (successStep) {
            successStep.classList.add('active');
        }
        
        // Fill success details
        const registeredEmail = document.getElementById('registeredEmail');
        if (registeredEmail) {
            registeredEmail.textContent = this.userData.email;
        }
        
        // Set app link
        const appLinks = document.querySelectorAll('a[href*="appvitatop"]');
        appLinks.forEach(link => {
            if (this.successRedirect) {
                link.href = this.successRedirect;
            }
        });
        
        // Add confetti effect
        this.showConfetti();
    }
    
    showConfetti() {
        // Simple confetti effect
        const colors = ['#667eea', '#764ba2', '#10b981', '#f59e0b'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            confetti.style.borderRadius = '50%';
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            confetti.animate([
                { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                confetti.remove();
            };
        }
    }
    
    startOver() {
        // Reset everything
        this.currentStep = 1;
        this.userData = {};
        this.personType = 'F';
        this.validationInProgress = false;
        
        // Reset form
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
            this.clearFieldError(input);
        });
        
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
            this.clearFieldError(select);
        });
        
        // Reset person type selection
        document.querySelectorAll('.person-type-option').forEach(option => {
            option.classList.remove('active');
        });
        const pfOption = document.querySelector('.person-type-option[data-type="F"]');
        if (pfOption) {
            pfOption.classList.add('active');
        }
        
        // Show step 1
        this.showStep(1);
        
        // Show progress bar
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        this.updateProgress();
        
        // Update document field
        this.updateDocumentField();
    }
    
    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(toast);
        
        // Add shake effect to container
        const container = document.querySelector('.container');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => {
                container.classList.remove('shake');
            }, 500);
        }
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}

// Utility functions for global access
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.nextElementSibling;
    
    if (!field || !toggle) return;
    
    const icon = toggle.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function nextStep() {
    if (window.app) {
        window.app.nextStep();
    }
}

function prevStep() {
    if (window.app) {
        window.app.prevStep();
    }
}

function finishRegistration() {
    if (window.app) {
        window.app.finishRegistration();
    }
}

function startOver() {
    if (window.app) {
        window.app.startOver();
    }
}

// Add CSS for animations and loading states
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .btn-primary.loading {
        position: relative;
        color: transparent !important;
        pointer-events: none;
    }
    
    .btn-primary.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .input-wrapper.error input,
    .input-wrapper.error select {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .form-group.error select {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .error-message i {
        font-size: 0.8rem;
    }
    
    .toast {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }
    
    .toast.success {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .toast.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    /* Loading state for validation */
    .validation-loading {
        position: relative;
    }
    
    .validation-loading::after {
        content: '';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    /* Smooth transitions */
    .input-wrapper input,
    .input-wrapper select {
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        transition: all 0.2s ease;
    }
    
    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .step {
        transition: all 0.3s ease;
    }
    
    .person-type-option {
        transition: all 0.2s ease;
    }
    
    .person-type-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .person-type-option.active {
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new OnboardingApp();
        console.log('Onboarding app initialized successfully');
    } catch (error) {
        console.error('Error initializing onboarding app:', error);
    }
});