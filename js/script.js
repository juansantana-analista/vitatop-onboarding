// Sistema de Onboarding Completo com Validação Robusta e Checkout Integrado
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
        this.registrationResponse = null; // Para armazenar resposta do cadastro
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMasks();
        this.updateProgress();
        this.loadStateFromSession();
    }
    
    loadStateFromSession() {
        // Carregar dados pré-preenchidos da sessão PHP se existirem
        const preFilledData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || ''
        };
        
        // Se há dados pré-preenchidos, armazená-los
        if (preFilledData.name || preFilledData.email || preFilledData.phone) {
            this.userData = { ...this.userData, ...preFilledData };
        }
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
        
        // Real-time validation with debounce
        document.querySelectorAll('input[required], select[required]').forEach(input => {
            // Immediate validation for basic checks
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                // Debounced validation for remote checks
                this.debounceValidation(input);
            });
            
            // Full validation on blur
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
        
        // Card input masks and validation
        this.setupCardInputs();
        
        // Enter key navigation
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.validationInProgress) {
                this.handleEnterKey();
            }
        });
    }
    
    setupCardInputs() {
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', () => {
                this.applyCardMask();
                this.detectCardType();
            });
        }
        
        const cardExpiry = document.getElementById('cardExpiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', () => this.applyExpiryMask());
        }
        
        const cardCVV = document.getElementById('cardCVV');
        if (cardCVV) {
            cardCVV.addEventListener('input', () => this.applyCVVMask());
        }
    }
    
    handleEnterKey() {
        const activeStep = document.querySelector('.step.active');
        if (!activeStep) return;
        
        switch (activeStep.id) {
            case 'step1':
            case 'step2':
                this.nextStep();
                break;
            case 'step3':
                if (this.selectedCombo) {
                    this.nextStep();
                } else {
                    this.handleComboSkip();
                }
                break;
            case 'step4':
                this.processPayment();
                break;
        }
    }
    
    // Debounced validation for remote checks
    debounceValidation(field) {
        clearTimeout(field.validationTimeout);
        field.validationTimeout = setTimeout(async () => {
            if (field.id === 'document' || field.id === 'email') {
                await this.validateField(field);
            }
        }, 800);
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
        
        // Add visual feedback
        this.addSelectionFeedback(selectedOption);
    }
    
    addSelectionFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    updateDocumentField() {
        const documentLabel = document.getElementById('documentLabel');
        const documentInput = document.getElementById('document');
        
        if (this.personType === 'J') {
            documentLabel.textContent = 'CNPJ *';
            documentInput.placeholder = '00.000.000/0000-00';
        } else {
            documentLabel.textContent = 'CPF *';
            documentInput.placeholder = '000.000.000-00';
        }
        
        // Clear current value and reapply mask
        documentInput.value = '';
        this.clearFieldError(documentInput);
    }
    
    // === MÁSCARA E FORMATAÇÃO ===
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
        
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }
    
    applyCepMask() {
        const input = document.getElementById('cep');
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }
    
    applyCardMask() {
        const input = document.getElementById('cardNumber');
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 16) {
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
        
        input.value = value;
    }
    
    applyExpiryMask() {
        const input = document.getElementById('cardExpiry');
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 4) {
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
        }
        
        input.value = value;
    }
    
    applyCVVMask() {
        const input = document.getElementById('cardCVV');
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 4) {
            input.value = value;
        }
    }
    
    detectCardType() {
        const input = document.getElementById('cardNumber');
        const value = input.value.replace(/\D/g, '');
        
        // Detect card type and adjust CVV length
        const cvvInput = document.getElementById('cardCVV');
        if (value.startsWith('34') || value.startsWith('37')) {
            // American Express - 4 digits CVV
            cvvInput.maxLength = 4;
            cvvInput.placeholder = '0000';
        } else {
            // Others - 3 digits CVV
            cvvInput.maxLength = 3;
            cvvInput.placeholder = '000';
        }
    }
    
    // === BUSCA DE ENDEREÇO ===
    async lookupAddress() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        const loading = document.getElementById('cepLoading');
        if (loading) loading.style.display = 'block';
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                this.fillAddressFields(data);
                this.showSuccess('Endereço encontrado automaticamente!');
            } else {
                this.showError('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.showError('Erro ao buscar CEP. Verifique sua conexão.');
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
        setTimeout(() => {
            document.getElementById('number').focus();
        }, 100);
    }
    
    // === VALIDAÇÃO DE CAMPOS ===
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
        
        this.clearFieldError(field);
        
        wrapper.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        wrapper.appendChild(errorDiv);
        
        // Scroll to error
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    async validateField(field) {
        if (this.validationInProgress && field.id !== 'document' && field.id !== 'email') {
            return true;
        }
        
        let isValid = true;
        let message = '';
        const fieldValue = field.value.trim();
        
        // Required field validation
        if (field.hasAttribute('required') && !fieldValue) {
            this.showFieldError(field, 'Este campo é obrigatório');
            return false;
        }
        
        if (!fieldValue) return true; // Se não é obrigatório e está vazio, tudo bem
        
        // Email validation
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                this.showFieldError(field, 'E-mail inválido');
                return false;
            }
            
            // Remote email validation
            try {
                this.validationInProgress = true;
                this.showFieldLoading(field, true);
                
                const emailAvailable = await this.validateEmailRemote(fieldValue);
                if (!emailAvailable) {
                    this.showFieldError(field, 'Este e-mail já está cadastrado');
                    return false;
                }
            } catch (error) {
                console.error('Erro na validação do email:', error);
                this.showFieldError(field, 'Erro ao validar e-mail. Tente novamente.');
                return false;
            } finally {
                this.validationInProgress = false;
                this.showFieldLoading(field, false);
            }
        }
        
        // Document validation
        if (field.id === 'document') {
            if (!this.validateDocumentFormat(fieldValue)) {
                const docType = this.personType === 'J' ? 'CNPJ' : 'CPF';
                this.showFieldError(field, `${docType} inválido`);
                return false;
            }
            
            // Remote document validation
            try {
                this.validationInProgress = true;
                this.showFieldLoading(field, true);
                
                const docAvailable = await this.validateDocumentRemote(fieldValue, this.personType);
                if (!docAvailable) {
                    const docType = this.personType === 'J' ? 'CNPJ' : 'CPF';
                    this.showFieldError(field, `Este ${docType} já está cadastrado`);
                    return false;
                }
            } catch (error) {
                console.error('Erro na validação do documento:', error);
                this.showFieldError(field, 'Erro ao validar documento. Tente novamente.');
                return false;
            } finally {
                this.validationInProgress = false;
                this.showFieldLoading(field, false);
            }
        }
        
        // Password validation
        if (field.id === 'password') {
            if (fieldValue.length < 8) {
                this.showFieldError(field, 'Senha deve ter no mínimo 8 caracteres');
                return false;
            }
            if (!/(?=.*[a-z])/.test(fieldValue)) {
                this.showFieldError(field, 'Senha deve conter pelo menos uma letra minúscula');
                return false;
            }
            if (!/(?=.*[A-Z])/.test(fieldValue)) {
                this.showFieldError(field, 'Senha deve conter pelo menos uma letra maiúscula');
                return false;
            }
            if (!/(?=.*\d)/.test(fieldValue)) {
                this.showFieldError(field, 'Senha deve conter pelo menos um número');
                return false;
            }
        }
        
        // Phone validation
        if (field.id === 'phone') {
            const phoneDigits = fieldValue.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                this.showFieldError(field, 'Telefone deve ter 10 ou 11 dígitos');
                return false;
            }
        }
        
        // CEP validation
        if (field.id === 'cep') {
            const cepDigits = fieldValue.replace(/\D/g, '');
            if (cepDigits.length !== 8) {
                this.showFieldError(field, 'CEP deve ter 8 dígitos');
                return false;
            }
        }
        
        // Name validation
        if (field.id === 'name') {
            if (fieldValue.length < 3) {
                this.showFieldError(field, 'Nome deve ter pelo menos 3 caracteres');
                return false;
            }
            if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(fieldValue)) {
                this.showFieldError(field, 'Nome deve conter apenas letras e espaços');
                return false;
            }
        }
        
        return true;
    }
    
    showFieldLoading(field, show) {
        const wrapper = field.closest('.input-wrapper') || field.closest('.form-group');
        let spinner = wrapper.querySelector('.validation-spinner');
        
        if (show) {
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.className = 'validation-spinner';
                spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                spinner.style.cssText = `
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6366f1;
                    z-index: 10;
                `;
                wrapper.style.position = 'relative';
                wrapper.appendChild(spinner);
            }
        } else {
            if (spinner) {
                spinner.remove();
            }
        }
    }
    
    validateDocumentFormat(doc) {
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
    
    async validateStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        const requiredFields = step.querySelectorAll('input[required], select[required]');
        let isValid = true;
        let errors = [];
        
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
            
            const response = await fetch('verificar_documento.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.text();
            
            // 'sucesso' = Documento DISPONÍVEL (pode cadastrar)
            // 'erro' = Documento JÁ CADASTRADO (não pode cadastrar)
            return result.trim() === 'sucesso';
            
        } catch (error) {
            console.error('Erro na validação de documento:', error);
            throw error;
        }
    }
    
    async validateEmailRemote(email) {
        try {
            const formData = new FormData();
            formData.append('email', email);
            
            const response = await fetch('verificar_email.php', {
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
    
    // === CARREGAMENTO E EXIBIÇÃO DE COMBOS ===
    async loadCombos() {
        const loadingEl = document.getElementById('combosLoading');
        const swiperEl = document.getElementById('combosSwiper');
        const noCombosEl = document.getElementById('noCombos');
        
        try {
            loadingEl.style.display = 'block';
            swiperEl.style.display = 'none';
            noCombosEl.style.display = 'none';
            
            const response = await fetch('buscar_combos.php');
            const result = await response.json();
            
            if (result.status === 'success' && result.data && result.data.length > 0) {
                this.combos = result.data;
                this.renderCombos();
                this.initSwiper();
                
                loadingEl.style.display = 'none';
                swiperEl.style.display = 'block';
            } else {
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
        
        return `
            <div class="combo-card" data-combo-id="${combo.id}" onclick="app.selectCombo(${index})">
                ${combo.destaque ? '<div class="combo-badge">MAIS VENDIDO</div>' : ''}
                <div class="combo-header">
                    <h4>${combo.nome}</h4>
                </div>
                ${combo.foto ? `
                <div class="combo-image">
                    <img src="https://vitatop.tecskill.com.br/${combo.foto}" alt="${combo.nome}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
                </div>
                ` : ''}
                <div class="combo-description">
                    ${combo.descricao_app || combo.descricao || 'Kit completo para acelerar seus resultados como distribuidor independente'}
                </div>
                <ul class="combo-features">
                    <li><i class="fas fa-check"></i> Kit de produtos premium</li>
                    <li><i class="fas fa-check"></i> Material de treinamento exclusivo</li>
                    <li><i class="fas fa-check"></i> Suporte especializado</li>
                    <li><i class="fas fa-check"></i> Estratégias de vendas comprovadas</li>
                    <li><i class="fas fa-check"></i> Acesso à comunidade VIP</li>
                </ul>
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
                delay: 5000,
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
            this.addSelectionFeedback(clickedCard);
            this.showSuccess('Combo desmarcado. Você pode continuar sem combo ou selecionar outro.');
        } else {
            // Remove selection from all combos
            document.querySelectorAll('.combo-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Add selection to clicked combo
            clickedCard.classList.add('selected');
            
            // Store selected combo
            this.selectedCombo = this.combos[index];
            
            this.addSelectionFeedback(clickedCard);
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
    
    // === MÉTODOS DE PAGAMENTO ===
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
        
        this.addSelectionFeedback(methodEl);
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
            
            const maxInstallments = 12;
            const minInstallmentValue = 10;
            
            for (let i = 1; i <= maxInstallments; i++) {
                const installmentValue = comboPrice / i;
                if (installmentValue >= minInstallmentValue) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `${i}x de R$ ${this.formatPrice(installmentValue)}${i === 1 ? ' sem juros' : ''}`;
                    installmentsSelect.appendChild(option);
                }
            }
        }
    }
    
    // === NAVEGAÇÃO ENTRE ETAPAS ===
    async nextStep() {
        if (this.validationInProgress) {
            return;
        }
        
        switch (this.currentStep) {
            case 1:
                await this.handleStep1();
                break;
            case 2:
                await this.handleStep2();
                break;
            case 3:
                await this.handleStep3();
                break;
        }
    }
    
    async handleStep1() {
        const continueBtn = document.querySelector('#step1 .btn-primary');
        const originalHtml = continueBtn.innerHTML;
        
        this.setButtonLoading(continueBtn, 'Validando dados...');
        
        try {
            this.validationInProgress = true;
            
            const isValid = await this.validateStep(1);
            
            if (!isValid) {
                this.showError('Por favor, corrija os erros antes de continuar');
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
            
            this.goToStep(2);
            
        } catch (error) {
            console.error('Erro na validação:', error);
            this.showError('Erro na validação. Tente novamente.');
        } finally {
            this.validationInProgress = false;
            this.resetButton(continueBtn, originalHtml);
        }
    }
    
    async handleStep2() {
        const continueBtn = document.querySelector('#step2 .btn-primary');
        const originalHtml = continueBtn.innerHTML;
        
        this.setButtonLoading(continueBtn, 'Validando endereço...');
        
        try {
            this.validationInProgress = true;
            
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
            
            this.goToStep(3);
            
            // Load combos when entering step 3
            await this.loadCombos();
            
        } catch (error) {
            console.error('Erro na validação:', error);
            this.showError('Erro na validação. Tente novamente.');
        } finally {
            this.validationInProgress = false;
            this.resetButton(continueBtn, originalHtml);
        }
    }
    
    async handleStep3() {
        if (this.selectedCombo) {
            // Has combo selected - go to payment
            this.goToStep(4);
            this.updatePaymentSummary();
        } else {
            // No combo selected - show confirmation with PNL techniques
            const confirmed = await this.showComboConfirmation();
            if (confirmed) {
                // Proceed to finish registration without combo
                await this.finishRegistration();
            }
        }
    }
    
    handleComboSkip() {
        this.handleStep3();
    }
    
    async showComboConfirmation() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease-out;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                margin: 20px;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                animation: slideUp 0.3s ease-out;
            `;
            
            modal.innerHTML = `
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #1e293b; margin-bottom: 16px; font-size: 24px;">Atenção! Oportunidade Única</h3>
                <p style="color: #64748b; margin-bottom: 24px; line-height: 1.6; font-size: 16px;">
                    Você está prestes a <strong style="color: #ef4444;">perder uma oportunidade exclusiva</strong> 
                    de acelerar seus resultados como distribuidor VitaTop! 
                </p>
                <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-weight: 600; margin-bottom: 12px;">
                        🚀 Mais de 10.000 pessoas já transformaram suas vidas com nossos combos especiais
                    </p>
                    <p style="color: #78350f; font-size: 14px;">
                        • Ganhos até 300% maiores no primeiro mês<br>
                        • Suporte premium 24/7<br>
                        • Estratégias exclusivas de vendas<br>
                        • Material de treinamento avançado
                    </p>
                </div>
                <p style="color: #dc2626; font-weight: 600; margin-bottom: 24px; font-size: 18px;">
                    ⏰ Esta oferta expira em poucos minutos!
                </p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-direction: column;">
                    <button id="goBackBtn" style="
                        background: linear-gradient(135deg, #7cbe42 0%, #00591f 100%);
                        color: white;
                        border: none;
                        padding: 16px 32px;
                        border-radius: 12px;
                        font-weight: 700;
                        cursor: pointer;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(124, 190, 66, 0.3);
                        transition: all 0.2s ease;
                    ">🎯 Sim! Quero ver os combos e acelerar meus resultados</button>
                    <button id="continueBtn" style="
                        background: transparent;
                        color: #94a3b8;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 500;
                        cursor: pointer;
                        font-size: 14px;
                        text-decoration: underline;
                    ">Não, prefiro começar sem vantagens</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Add hover effects
            const goBackBtn = modal.querySelector('#goBackBtn');
            goBackBtn.addEventListener('mouseenter', () => {
                goBackBtn.style.transform = 'translateY(-2px)';
                goBackBtn.style.boxShadow = '0 6px 20px rgba(124, 190, 66, 0.4)';
            });
            goBackBtn.addEventListener('mouseleave', () => {
                goBackBtn.style.transform = '';
                goBackBtn.style.boxShadow = '0 4px 12px rgba(124, 190, 66, 0.3)';
            });
            
            // Add event listeners
            goBackBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });
            
            modal.querySelector('#continueBtn').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
        });
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
        
        this.setButtonLoading(paymentButton, 'Processando pagamento...');
        
        try {
            // Validate card fields if card payment
            if (this.selectedPaymentMethod === 'card') {
                if (!this.validateCardFields()) {
                    return;
                }
            }
            
            // First, register the user to get pessoa_id and endereco_id
            const registrationResult = await this.processRegistration();
            
            if (!registrationResult.success) {
                this.showError(registrationResult.message || 'Erro no cadastro');
                return;
            }
            
            // Now process payment with the registration data
            const paymentResult = await this.submitPayment(registrationResult.data);
            
            if (paymentResult.success) {
                this.showSuccessStep(true);
            } else {
                this.showError(paymentResult.message || 'Erro ao processar pagamento');
            }
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            this.showError('Erro ao processar pagamento. Tente novamente.');
        } finally {
            this.resetButton(paymentButton, originalHtml);
        }
    }
    
    validateCardFields() {
        const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
        
        for (const fieldId of cardFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo é obrigatório');
                return false;
            }
        }
        
        // Validate card number
        const cardNumber = document.getElementById('cardNumber').value.replace(/\D/g, '');
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            this.showFieldError(document.getElementById('cardNumber'), 'Número do cartão inválido');
            return false;
        }
        
        // Validate expiry
        const expiry = document.getElementById('cardExpiry').value;
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            this.showFieldError(document.getElementById('cardExpiry'), 'Data de validade inválida');
            return false;
        }
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        
        if (expiryDate < currentDate) {
            this.showFieldError(document.getElementById('cardExpiry'), 'Cartão expirado');
            return false;
        }
        
        // Validate CVV
        const cvv = document.getElementById('cardCVV').value;
        if (cvv.length < 3 || cvv.length > 4) {
            this.showFieldError(document.getElementById('cardCVV'), 'CVV inválido');
            return false;
        }
        
        return true;
    }
    
    async submitPayment(registrationData) {
        try {
            const paymentData = new FormData();
            paymentData.append('action', 'process_payment');
            paymentData.append('comboId', this.selectedCombo.id);
            paymentData.append('paymentMethod', this.selectedPaymentMethod);
            paymentData.append('valor', this.selectedCombo.preco);
            paymentData.append('pessoaId', registrationData.pessoa_id);
            paymentData.append('enderecoId', registrationData.endereco_id);
            
            // Add card data if needed
            if (this.selectedPaymentMethod === 'card') {
                paymentData.append('cardNumber', document.getElementById('cardNumber').value);
                paymentData.append('cardName', document.getElementById('cardName').value);
                paymentData.append('cardExpiry', document.getElementById('cardExpiry').value);
                paymentData.append('cardCVV', document.getElementById('cardCVV').value);
                paymentData.append('installments', document.getElementById('installments').value || 1);
            }
            
            const response = await fetch('ajax_handler.php', {
                method: 'POST',
                body: paymentData
            });
            
            const result = await response.json();
            
            return {
                success: result.status === 'success',
                message: result.message,
                data: result.data
            };
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            return {
                success: false,
                message: 'Erro na comunicação com o servidor'
            };
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
    
    goToStep(stepNumber) {
        this.currentStep = stepNumber;
        this.showStep(stepNumber);
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
    
    // === PROCESSAMENTO DE CADASTRO ===
    async finishRegistration() {
        if (this.validationInProgress) {
            return;
        }
        
        const submitButton = document.querySelector('#step3 .btn-primary');
        const originalHtml = submitButton.innerHTML;
        
        this.setButtonLoading(submitButton, 'Finalizando cadastro...');
        
        try {
            this.validationInProgress = true;
            
            if (!this.userData.name || !this.userData.email || !this.userData.document || 
                !this.userData.password || !this.userData.phone) {
                throw new Error('Dados obrigatórios faltando');
            }
            
            const result = await this.processRegistration();
            
            if (result.success) {
                this.showSuccessStep(false);
            } else {
                this.showError(result.message || 'Erro ao finalizar cadastro');
            }
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showError('Erro ao finalizar cadastro. Tente novamente.');
        } finally {
            this.validationInProgress = false;
            this.resetButton(submitButton, originalHtml);
        }
    }
    
    async processRegistration() {
        try {
            const formData = new FormData();
            
            formData.append('action', 'register');
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
            
            // Add combo ID if selected
            if (this.selectedCombo) {
                formData.append('idProduto', this.selectedCombo.id);
            }
            
            const response = await fetch('ajax_handler.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let result;
            try {
                const responseText = await response.text();
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                throw new Error('Resposta inválida do servidor');
            }
            
            if (result.status === 'success') {
                this.registrationResponse = result;
                return {
                    success: true,
                    message: result.message,
                    data: result.data || {}
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Erro no cadastro'
                };
            }
            
        } catch (error) {
            console.error('Erro no processamento do cadastro:', error);
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
        if (registeredEmail) {
            registeredEmail.textContent = this.userData.email;
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
        const colors = ['#7cbe42', '#00591f', '#10b981', '#f59e0b'];
        
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 9999;
                pointer-events: none;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
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
        this.selectedCombo = null;
        this.selectedPaymentMethod = null;
        this.registrationResponse = null;
        
        // Reset forms
        document.querySelectorAll('input').forEach(input => {
            if (input.id !== 'name' && input.id !== 'email' && input.id !== 'phone') {
                input.value = '';
            }
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
    
    // === UTILITÁRIOS DE UI ===
    setButtonLoading(button, text) {
        button.disabled = true;
        button.classList.add('loading');
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
    
    resetButton(button, originalHtml) {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = originalHtml;
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
        
        // Add shake effect to container
        const container = document.querySelector('.container');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => {
                container.classList.remove('shake');
            }, 500);
        }
    }
    
    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
        toast.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        const bgColor = type === 'success' ? '#10b981' : '#ef4444';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            max-width: 350px;
        `;
        
        document.body.appendChild(toast);
        
        const duration = type === 'error' ? 4000 : 3000;
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
    }
}

// === FUNÇÕES GLOBAIS ===
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

// === ESTILOS CSS DINÂMICOS ===
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
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
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
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
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
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }
    
    .toast.success {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .toast.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .validation-spinner {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6366f1;
        z-index: 10;
    }
    
    .validation-loading {
        position: relative;
    }
    
    /* Smooth transitions for all interactive elements */
    .input-wrapper input,
    .input-wrapper select,
    .btn-primary,
    .btn-secondary,
    .person-type-option,
    .combo-card,
    .payment-method {
        transition: all 0.2s ease;
    }
    
    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .step {
        transition: all 0.3s ease;
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
        cursor: pointer;
    }
    
    .combo-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .combo-card.selected {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(124, 190, 66, 0.2);
        border-color: #7cbe42 !important;
    }
    
    .payment-method {
        transition: all 0.2s ease;
        cursor: pointer;
    }
    
    .payment-method:hover {
        border-color: #7cbe42;
        background: rgba(124, 190, 66, 0.05);
    }
    
    .payment-method.selected {
        border-color: #7cbe42 !important;
        background: rgba(124, 190, 66, 0.1) !important;
    }
    
    /* Enhanced loading states */
    .combos-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #64748b;
    }
    
    .combos-loading i {
        font-size: 32px;
        margin-bottom: 16px;
        color: #7cbe42;
    }
    
    /* Success animation improvements */
    .success-circle {
        animation: successPulse 1s ease-out;
    }
    
    @keyframes successPulse {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    /* Enhanced combo card styling */
    .combo-card.selected::before {
        content: '✓ Selecionado';
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: #7cbe42;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        z-index: 2;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }
    
    /* Enhanced form field focus states */
    .input-wrapper input:focus,
    .input-wrapper select:focus {
        outline: none;
        border-color: #7cbe42 !important;
        box-shadow: 0 0 0 3px rgba(124, 190, 66, 0.1) !important;
    }
    
    /* Improved password toggle */
    .toggle-password {
        position: absolute;
        right: 16px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .toggle-password:hover {
        color: #64748b;
        background: rgba(0, 0, 0, 0.05);
    }
    
    /* Enhanced progress bar */
    .progress-fill {
        background: linear-gradient(135deg, #7cbe42 0%, #00591f 100%);
        transition: width 0.5s ease;
        position: relative;
        overflow: hidden;
    }
    
    .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    /* Mobile responsiveness improvements */
    @media (max-width: 768px) {
        .combo-card {
            margin-bottom: 16px;
        }
        
        .payment-method {
            margin-bottom: 12px;
        }
        
        .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
        }
        
        .form-actions {
            grid-template-columns: 1fr;
            gap: 12px;
        }
        
        .toast {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
    
    /* Custom scrollbar for better UX */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }
    
    ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;
document.head.appendChild(style);

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new OnboardingApp();
        console.log('✅ Sistema de onboarding VitaTop inicializado com sucesso');
        
        // Add some initial visual feedback
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.6s ease-out';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar o sistema de onboarding:', error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #7cbe42 0%, #00591f 100%);
                font-family: Inter, sans-serif;
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h2>Oops! Algo deu errado</h2>
                    <p>Tente recarregar a página ou entre em contato conosco.</p>
                    <button onclick="location.reload()" style="
                        background: white;
                        color: #00591f;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Recarregar Página</button>
                </div>
            </div>
        `;
    }
});