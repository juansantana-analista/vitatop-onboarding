// Onboarding Logic
class OnboardingApp {
    constructor() {
        this.currentStep = 1;
        this.userData = {};
        this.personType = 'pf'; // Default to Pessoa Física
        
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
        
        // Form validation on input
        document.querySelectorAll('input[required], select[required]').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
        
        // Enter key navigation
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
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
        
        if (this.personType === 'pj') {
            documentLabel.textContent = 'CNPJ *';
            documentInput.placeholder = '00.000.000/0000-00';
        } else {
            documentLabel.textContent = 'CPF *';
            documentInput.placeholder = '000.000.000-00';
        }
        
        // Clear current value and reapply mask
        documentInput.value = '';
    }
    
    applyDocumentMask() {
        const input = document.getElementById('document');
        let value = input.value.replace(/\D/g, '');
        
        if (this.personType === 'pj') {
            // CNPJ mask: 00.000.000/0000-00
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            // CPF mask: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        }
        
        input.value = value;
    }
    
    applyPhoneMask() {
        const input = document.getElementById('phone');
        let value = input.value.replace(/\D/g, '');
        
        // Phone mask: (00) 00000-0000
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        
        input.value = value;
    }
    
    applyCepMask() {
        const input = document.getElementById('cep');
        let value = input.value.replace(/\D/g, '');
        
        // CEP mask: 00000-000
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        
        input.value = value;
    }
    
    async lookupAddress() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        const loading = document.getElementById('cepLoading');
        loading.style.display = 'block';
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                this.fillAddressFields(data);
                this.showSuccess('Endereço encontrado!');
            } else {
                this.showError('CEP não encontrado');
            }
        } catch (error) {
            this.showError('Erro ao buscar CEP');
        } finally {
            loading.style.display = 'none';
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
    
    validateField(field) {
        const wrapper = field.closest('.input-wrapper');
        const errorMessage = wrapper.querySelector('.error-message');
        
        // Remove existing error state
        wrapper.classList.remove('error');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        let isValid = true;
        let message = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'Este campo é obrigatório';
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'E-mail inválido';
            }
        }
        
        // Document validation
        if (field.id === 'document' && field.value) {
            if (!this.validateDocument(field.value)) {
                isValid = false;
                message = this.personType === 'pj' ? 'CNPJ inválido' : 'CPF inválido';
            }
        }
        
        // Password validation
        if (field.id === 'password' && field.value) {
            if (field.value.length < 8) {
                isValid = false;
                message = 'Senha deve ter no mínimo 8 caracteres';
            }
        }
        
        if (!isValid) {
            wrapper.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            wrapper.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }
    
    validateDocument(doc) {
        const cleanDoc = doc.replace(/\D/g, '');
        
        if (this.personType === 'pj') {
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
    
    validateStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        const requiredFields = step.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    nextStep() {
        if (!this.validateStep(1)) {
            this.showError('Por favor, corrija os erros antes de continuar');
            return;
        }
        
        // Save step 1 data
        this.userData = {
            personType: this.personType,
            name: document.getElementById('name').value,
            document: document.getElementById('document').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
        };
        
        this.currentStep = 2;
        this.showStep(2);
        this.updateProgress();
        
        // Add transition effect
        this.addTransitionEffect();
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
        
        if (this.currentStep === 1) {
            progressFill.style.width = '50%';
            progressText.textContent = 'Etapa 1 de 2';
        } else if (this.currentStep === 2) {
            progressFill.style.width = '100%';
            progressText.textContent = 'Etapa 2 de 2';
        }
    }
    
    addTransitionEffect() {
        const container = document.querySelector('.container');
        container.style.transform = 'scale(0.98)';
        setTimeout(() => {
            container.style.transform = '';
        }, 200);
    }
    
    async finishRegistration() {
        if (!this.validateStep(2)) {
            this.showError('Por favor, corrija os erros antes de finalizar');
            return;
        }
        
        // Save step 2 data
        this.userData.address = {
            cep: document.getElementById('cep').value,
            street: document.getElementById('street').value,
            number: document.getElementById('number').value,
            complement: document.getElementById('complement').value,
            neighborhood: document.getElementById('neighborhood').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value
        };
        
        // Show loading state
        const submitButton = document.querySelector('.btn-primary');
        submitButton.classList.add('loading');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Show success step
            this.showSuccessStep();
            
        } catch (error) {
            this.showError('Erro ao realizar cadastro. Tente novamente.');
            submitButton.classList.remove('loading');
            submitButton.innerHTML = 'Finalizar cadastro <i class="fas fa-check"></i>';
        }
    }
    
    async simulateApiCall() {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('User registered:', this.userData);
                resolve();
            }, 2000);
        });
    }
    
    showSuccessStep() {
        // Hide progress bar
        document.querySelector('.progress-container').style.display = 'none';
        
        // Show success step
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.getElementById('successStep').classList.add('active');
        
        // Fill success details
        document.getElementById('registeredEmail').textContent = this.userData.email;
        
        // Set app link (replace with your actual app URL)
        document.getElementById('appLink').href = 'https://app.affiliatehub.com';
        
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
        this.personType = 'pf';
        
        // Reset form
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Reset person type selection
        document.querySelectorAll('.person-type-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.person-type-option[data-type="pf"]').classList.add('active');
        
        // Show step 1
        this.showStep(1);
        
        // Show progress bar
        document.querySelector('.progress-container').style.display = 'block';
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
        `;
        
        document.body.appendChild(toast);
        
        // Add shake effect to container
        document.querySelector('.container').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('shake');
        }, 500);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}

// Utility functions for global access
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.nextElementSibling;
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
    app.nextStep();
}

function prevStep() {
    app.prevStep();
}

function finishRegistration() {
    app.finishRegistration();
}

function startOver() {
    app.startOver();
}

// Add CSS for toast animations
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
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OnboardingApp();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingApp;
}