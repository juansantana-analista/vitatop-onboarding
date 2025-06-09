// Onboarding Logic com Validação Robusta e Funcionalidades de Combo/Pagamento
class OnboardingApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.userData = {};
        this.personType = 'F'; // Default to Pessoa Física
        this.validationInProgress = false;
        this.selectedCombo = null;
        this.combos = [];
        this.selectedPaymentMethod = null;
        this.swiperInstance = null;
        this.registeredUser = null; // Store user data after registration
        
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
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget);
            });
        });
        
        // Card input masks
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', () => this.applyCardMask());
        }
        
        const cardExpiry = document.getElementById('cardExpiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', () => this.applyExpiryMask());
        }
        
        const cardCVV = document.getElementById('cardCVV');
        if (cardCVV) {
            cardCVV.addEventListener('input', () => this.applyCVVMask());
        }
        
        // Enter key navigation
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.validationInProgress) {
                const activeStep = document.querySelector('.step.active');
                if (activeStep.id === 'step1' || activeStep.id === 'step2') {
                    this.nextStep();
                } else if (activeStep.id === 'step3') {
                    this.handleComboStep();
                } else if (activeStep.id === 'step4') {
                    this.processPayment();
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
    
    applyCardMask() {
        const input = document.getElementById('cardNumber');
        let value = input.value.replace(/\D/g, '');
        
        // Card mask: 0000 0000 0000 0000
        if (value.length <= 16) {
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
        
        input.value = value;
    }
    
    applyExpiryMask() {
        const input = document.getElementById('cardExpiry');
        let value = input.value.replace(/\D/g, '');
        
        // Expiry mask: MM/AA
        if (value.length <= 4) {
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
        }
        
        input.value = value;
    }
    
    applyCVVMask() {
        const input = document.getElementById('cardCVV');
        let value = input.value.replace(/\D/g, '');
        
        // CVV mask: limit to 4 digits
        if (value.length <= 4) {
            input.value = value;
        }
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
    
    async loadCombos() {
        const loadingEl = document.getElementById('combosLoading');
        const swiperEl = document.getElementById('combosSwiper');
        const noCombosEl = document.getElementById('noCombos');
        
        try {
            loadingEl.style.display = 'block';
            swiperEl.style.display = 'none';
            noCombosEl.style.display = 'none';
            
            const response = await fetch(OnboardingConfig.endpoints.combos);
            const result = await response.json();
            
            if (result.status === 'success' && result.data && result.data.length > 0) {
                this.combos = result.data;
                this.renderCombos();
                this.initSwiper();
                
                loadingEl.style.display = 'none';
                swiperEl.style.display = 'block';
            } else {
                // No combos available
                loadingEl.style.display = 'none';
                noCombosEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao carregar combos:', error);
            loadingEl.style.display = 'none';
            noCombosEl.style.display = 'block';
        }
    }
    
    renderCombos() {
        const wrapper = document.getElementById('combosWrapper');
        wrapper.innerHTML = '';
        
        this.combos.forEach((combo, index) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = this.createComboCard(combo, index);
            wrapper.appendChild(slide);
        });
    }
    
    createComboCard(combo, index) {
        const discount = combo.desconto || 0;
        const originalPrice = combo.preco_original || combo.preco;
        const currentPrice = combo.preco;
        const installments = Math.floor(currentPrice / 10); // Exemplo de parcelas
        
        return `
            <div class="combo-card" data-combo-id="${combo.id}" onclick="app.selectCombo(${index})">
                ${combo.destaque ? '<div class="combo-badge">MAIS VENDIDO</div>' : ''}
                <div class="combo-header">
                    <h4>${combo.nome}</h4>
                </div>
                <div class="combo-image">
                    <img src="https://vitatop.tecskill.com.br/${combo.foto}" alt="${combo.nome}" style="width: 100%; height: auto;" />
                </div>
                <div class="combo-description">
                    ${combo.descricao_app || 'Combo completo para acelerar seus resultados'}
                </div>
                <!-- 
                <ul class="combo-features">
                    ${combo.beneficios ? combo.beneficios.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('') : `
                        <li><i class="fas fa-check"></i> Kit de produtos premium</li>
                        <li><i class="fas fa-check"></i> Material de treinamento</li>
                        <li><i class="fas fa-check"></i> Suporte especializado</li>
                        <li><i class="fas fa-check"></i> Estratégias de vendas</li>
                    `}
                </ul>
                -->
                <div class="combo-price">
                    <div>
                        ${discount > 0 ? `<div class="price-original">R$ ${this.formatPrice(originalPrice)}</div>` : ''}
                        <div class="price-current">R$ ${this.formatPrice(currentPrice)}</div>
                        <div class="price-installments">ou 12x de R$ ${this.formatPrice(currentPrice / 12)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
    
    initSwiper() {
        if (this.swiperInstance) {
            this.swiperInstance.destroy();
        }
        
        this.swiperInstance = new Swiper('.combos-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: this.combos.length > 1,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
            }
        });
    }
    
    selectCombo(index) {
        const clickedCard = document.querySelector(`[data-combo-id="${this.combos[index].id}"]`);
        
        // Check if this combo is already selected
        if (this.selectedCombo && this.selectedCombo.id === this.combos[index].id) {
            // Deselect the combo
            this.selectedCombo = null;
            clickedCard.classList.remove('selected');
            
            // Add deselection animation
            clickedCard.style.transform = 'scale(1.02)';
            setTimeout(() => {
                clickedCard.style.transform = '';
            }, 150);
            
            // Show success message for deselection
            this.showSuccess('Combo desmarcado. Você pode continuar sem combo ou selecionar outro.');
        } else {
            // Remove selection from all combos
            document.querySelectorAll('.combo-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Add selection to clicked combo
            if (clickedCard) {
                clickedCard.classList.add('selected');
            }
            
            // Store selected combo
            this.selectedCombo = this.combos[index];
            
            // Add selection animation
            if (clickedCard) {
                clickedCard.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    clickedCard.style.transform = '';
                }, 150);
            }
            
            // Show success message for selection
            this.showSuccess(`Combo "${this.combos[index].nome}" selecionado!`);
        }
        
        // Update UI
        this.updateComboSelection();
    }
    
    updateComboSelection() {
        const selectedComboEl = document.getElementById('selectedCombo');
        const comboNameEl = document.getElementById('selectedComboName');
        const comboPriceEl = document.getElementById('selectedComboPrice');
        const continueWithoutBtn = document.getElementById('continueWithoutCombo');
        const continueWithBtn = document.getElementById('continueWithCombo');
        
        if (this.selectedCombo) {
            selectedComboEl.style.display = 'block';
            comboNameEl.textContent = this.selectedCombo.nome;
            comboPriceEl.textContent = `R$ ${this.formatPrice(this.selectedCombo.preco)}`;
            
            continueWithoutBtn.style.display = 'none';
            continueWithBtn.style.display = 'flex';
        } else {
            selectedComboEl.style.display = 'none';
            continueWithoutBtn.style.display = 'flex';
            continueWithBtn.style.display = 'none';
        }
    }
    
    selectPaymentMethod(methodEl) {
        // Remove selection from all methods
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('selected');
        });
        
        // Add selection to clicked method
        methodEl.classList.add('selected');
        
        // Store selected method
        this.selectedPaymentMethod = methodEl.dataset.method;
        
        // Show/hide payment details
        this.updatePaymentDetails();
        
        // Update installments for card
        if (this.selectedPaymentMethod === 'card') {
            this.updateInstallments();
        }
    }
    
    updatePaymentDetails() {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.style.display = 'none';
        });
        
        // Show details for selected method
        if (this.selectedPaymentMethod === 'card') {
            const cardDetails = document.getElementById('cardDetails');
            if (cardDetails) {
                cardDetails.style.display = 'block';
            }
        }
    }
    
    updateInstallments() {
        const installmentsSelect = document.getElementById('installments');
        const comboPrice = this.selectedCombo ? this.selectedCombo.preco : 0;
        
        if (installmentsSelect && comboPrice > 0) {
            installmentsSelect.innerHTML = '';
            
            const maxInstallments = OnboardingConfig.payment.methods.card.maxInstallments;
            for (let i = 1; i <= maxInstallments; i++) {
                const installmentValue = comboPrice / i;
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}x de R$ ${this.formatPrice(installmentValue)}${i === 1 ? ' sem juros' : ''}`;
                installmentsSelect.appendChild(option);
            }
        }
    }
    
    async nextStep() {
        // Prevent multiple simultaneous validations
        if (this.validationInProgress) {
            return;
        }
        
        // Handle different step transitions
        if (this.currentStep === 1) {
            await this.handleStep1();
        } else if (this.currentStep === 2) {
            await this.handleStep2();
        } else if (this.currentStep === 3) {
            await this.handleStep3();
        }
    }
    
    async handleStep1() {
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
    
    async handleStep2() {
        // Show loading on continue button
        const continueBtn = document.querySelector('#step2 .btn-primary');
        const originalHtml = continueBtn.innerHTML;
        continueBtn.disabled = true;
        continueBtn.classList.add('loading');
        continueBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Validando...`;
        
        try {
            this.validationInProgress = true;
            
            // CRITICAL: Validate step 2
            const isValid = await this.validateStep(2);
            
            if (!isValid) {
                this.showError('Por favor, corrija os erros antes de continuar');
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
            
            this.currentStep = 3;
            this.showStep(3);
            this.updateProgress();
            this.addTransitionEffect();
            
            // Load combos when entering step 3
            await this.loadCombos();
            
        } catch (error) {
            console.error('❌ ERRO na validação:', error);
            this.showError('Erro na validação. Tente novamente.');
        } finally {
            this.validationInProgress = false;
            continueBtn.disabled = false;
            continueBtn.classList.remove('loading');
            continueBtn.innerHTML = originalHtml;
        }
    }
    
    // NOVO FLUXO: Realizar cadastro na step 3 independente da seleção de combo
    async handleStep3() {
        // Prevent multiple simultaneous registrations
        if (this.validationInProgress) {
            return;
        }
        
        // Show loading state
        const submitButton = this.selectedCombo ? 
            document.getElementById('continueWithCombo') : 
            document.getElementById('continueWithoutCombo');
        
        const originalHtml = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Realizando cadastro...`;
        
        try {
            this.validationInProgress = true;
            
            // FINAL VALIDATION BEFORE REGISTRATION
            if (!this.userData.name || !this.userData.email || !this.userData.document || 
                !this.userData.password || !this.userData.phone || !this.userData.address) {
                throw new Error('Dados obrigatórios faltando');
            }
            
            // Process registration
            const registrationResult = await this.processRegistration();
            
            if (registrationResult.success) {
                console.log(registrationResult);
                return;
                // Store registered user data
                this.registeredUser = {
                    pessoa_id: registrationResult.data.pessoa_id,
                    endereco_id: registrationResult.data.endereco_id,
                    email: this.userData.email
                };
                
                // Check if combo was selected
                if (this.selectedCombo) {
                    // Go to payment step
                    this.currentStep = 4;
                    this.showStep(4);
                    this.updateProgress();
                    this.updatePaymentSummary();
                    this.addTransitionEffect();
                    this.showSuccess('Cadastro realizado! Finalize o pagamento do seu combo.');
                } else {
                    // Show success step directly
                    this.showSuccessStep(false);
                }
            } else {
                throw new Error(registrationResult.message || 'Erro no cadastro');
            }
            
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
    
    updatePaymentSummary() {
        const comboNameEl = document.getElementById('comboNamePayment');
        const comboPriceEl = document.getElementById('comboPricePayment');
        
        if (this.selectedCombo && comboNameEl && comboPriceEl) {
            comboNameEl.textContent = this.selectedCombo.nome;
            comboPriceEl.textContent = `R$ ${this.formatPrice(this.selectedCombo.preco)}`;
        }
    }
    
async processPayment() {
        if (!this.selectedPaymentMethod) {
            this.showError('Selecione uma forma de pagamento');
            return;
        }
        
        const paymentButton = document.getElementById('paymentButton');
        const originalHtml = paymentButton.innerHTML;
        paymentButton.disabled = true;
        paymentButton.classList.add('loading');
        paymentButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${OnboardingConfig.ui.loadingMessages.processingPayment}`;
        
        try {
            // Validate card fields if card payment
            if (this.selectedPaymentMethod === 'card') {
                const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
                for (const fieldId of cardFields) {
                    const field = document.getElementById(fieldId);
                    if (!field.value.trim()) {
                        this.showError('Preencha todos os dados do cartão');
                        return;
                    }
                }
            }
            
            // Prepare payment data with registered user info
            const paymentData = new FormData();
            paymentData.append('action', 'process_payment');
            paymentData.append('pessoaId', this.registeredUser.pessoa_id);
            paymentData.append('enderecoId', this.registeredUser.endereco_id);
            paymentData.append('comboId', this.selectedCombo.id);
            paymentData.append('paymentMethod', this.selectedPaymentMethod);
            paymentData.append('valor', this.selectedCombo.preco);
            
            // Add card data if needed
            if (this.selectedPaymentMethod === 'card') {
                paymentData.append('cardNumber', document.getElementById('cardNumber').value);
                paymentData.append('cardName', document.getElementById('cardName').value);
                paymentData.append('cardExpiry', document.getElementById('cardExpiry').value);
                paymentData.append('cardCVV', document.getElementById('cardCVV').value);
                paymentData.append('installments', document.getElementById('installments').value || 1);
            }
            
            // LOG: Dados sendo enviados para o servidor
            console.log('🔄 ENVIANDO DADOS DE PAGAMENTO:');
            console.log('- Pessoa ID:', this.registeredUser.pessoa_id);
            console.log('- Endereço ID:', this.registeredUser.endereco_id);
            console.log('- Combo ID:', this.selectedCombo.id);
            console.log('- Método de Pagamento:', this.selectedPaymentMethod);
            console.log('- Valor:', this.selectedCombo.preco);
            console.log('- Combo Selecionado:', this.selectedCombo);
            
            // Submit payment
            const response = await fetch(OnboardingConfig.endpoints.payment, {
                method: 'POST',
                body: paymentData
            });
            
            // LOG: Status da resposta HTTP
            console.log('📡 RESPOSTA HTTP STATUS:', response.status, response.statusText);
            
            // Get response text first to log it
            const responseText = await response.text();
            console.log('📄 RESPOSTA RAW DO SERVIDOR:', responseText);
            
            // Try to parse as JSON
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('✅ RESPOSTA JSON PARSEADA:', result);
            } catch (parseError) {
                console.error('❌ ERRO AO FAZER PARSE DO JSON:', parseError);
                console.log('📄 TEXTO DA RESPOSTA:', responseText);
                throw new Error('Resposta inválida do servidor de pagamento');
            }
            
            // LOG: Detalhes da resposta da API
            if (result.status === 'success') {
                console.log('🎉 PAGAMENTO PROCESSADO COM SUCESSO!');
                console.log('📋 DADOS RETORNADOS PELA API:', result.data);
                
                // Log específico dos dados da API Safe2Pay
                if (result.data) {
                    console.log('💳 DETALHES DO PAGAMENTO:');
                    console.log('- Transaction ID:', result.data.transactionId || 'N/A');
                    console.log('- Payment ID:', result.data.paymentId || 'N/A');
                    console.log('- Status:', result.data.status || 'N/A');
                    console.log('- Valor:', result.data.amount || result.data.valor || 'N/A');
                    console.log('- Método:', result.data.paymentMethod || 'N/A');
                    
                    // Se for PIX, log do QR Code ou chave PIX
                    if (result.data.pixQrCode || result.data.qrCode) {
                        console.log('🔳 QR CODE PIX:', result.data.pixQrCode || result.data.qrCode);
                    }
                    
                    // Se for boleto, log da URL
                    if (result.data.boletoUrl || result.data.bankSlipUrl) {
                        console.log('📄 URL DO BOLETO:', result.data.boletoUrl || result.data.bankSlipUrl);
                    }
                    
                    // Se for cartão, log dos detalhes
                    if (result.data.cardDetails) {
                        console.log('💳 DETALHES DO CARTÃO:', result.data.cardDetails);
                    }
                    
                    // Log de qualquer URL de redirecionamento
                    if (result.data.redirectUrl || result.data.checkoutUrl) {
                        console.log('🔗 URL DE REDIRECIONAMENTO:', result.data.redirectUrl || result.data.checkoutUrl);
                    }
                }
                
                this.showSuccessStep(true);
            } else {
                console.error('❌ ERRO NO PAGAMENTO:');
                console.error('- Status:', result.status);
                console.error('- Mensagem:', result.message);
                console.error('- Dados:', result.data);
                
                this.showError(result.message || OnboardingConfig.ui.errorMessages.paymentError);
            }
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO NO PAGAMENTO:', error);
            console.error('- Tipo do erro:', error.name);
            console.error('- Mensagem:', error.message);
            console.error('- Stack:', error.stack);
            
            this.showError(OnboardingConfig.ui.errorMessages.paymentError);
        } finally {
            paymentButton.disabled = false;
            paymentButton.classList.remove('loading');
            paymentButton.innerHTML = originalHtml;
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.addTransitionEffect();
        }
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
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Etapa ${this.currentStep} de ${this.totalSteps}`;
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
    
    async processRegistration() {
        try {
            // Prepare form data according to ajax_handler.php structure
            const formData = new FormData();
            
            // Add action identifier for AJAX handler
            formData.append('action', 'register');
            
            // Add all required fields
            formData.append('tipoPessoa', this.userData.personType);
            formData.append('nomeAfiliado', this.userData.name);
            formData.append('razaoSocial', this.userData.personType === 'J' ? this.userData.name : '');
            formData.append('dataNascimento', '');
            formData.append('genero', '');
            
            if (this.userData.personType === 'F') {
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
            
            // Submit to ajax_handler.php for JSON response
            const response = await fetch(OnboardingConfig.endpoints.register, {
                method: 'POST',
                body: formData
            });
            
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
                return {
                    success: true,
                    data: result.data || {}
                };
            } else {
                console.log('❌ CADASTRO FALHOU:', result.message);
                return {
                    success: false,
                    message: result.message || 'Erro no cadastro'
                };
            }
            
        } catch (error) {
            console.error('❌ ERRO no processamento do cadastro:', error);
            return {
                success: false,
                message: error.message || 'Erro interno no cadastro'
            };
        }
    }
    
    showSuccessStep(hasPayment = false) {
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
        
        // Update success message
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            if (hasPayment) {
                successMessage.textContent = 'Cadastro e pagamento realizados com sucesso!';
            } else {
                successMessage.textContent = 'Seu cadastro foi realizado com sucesso';
            }
        }
        
        // Fill success details
        const registeredEmail = document.getElementById('registeredEmail');
        if (registeredEmail && this.registeredUser) {
            registeredEmail.textContent = this.registeredUser.email;
        }
        
        // Show payment success item if payment was made
        const paymentSuccessItem = document.getElementById('paymentSuccessItem');
        if (paymentSuccessItem) {
            paymentSuccessItem.style.display = hasPayment ? 'flex' : 'none';
        }
        
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
        this.totalSteps = 4;
        this.userData = {};
        this.personType = 'F';
        this.validationInProgress = false;
        this.selectedCombo = null;
        this.selectedPaymentMethod = null;
        this.registeredUser = null;
        
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
        
        // Reset combo selection
        document.querySelectorAll('.combo-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateComboSelection();
        
        // Reset payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('selected');
        });
        this.updatePaymentDetails();
        
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

function processPayment() {
    if (window.app) {
        window.app.processPayment();
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
    
    .combo-card {
        transition: all 0.3s ease;
    }
    
    .payment-method {
        transition: all 0.2s ease;
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