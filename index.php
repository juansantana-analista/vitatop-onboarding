<?php
include("funcoes/requisicoes.php");

// Validação do indicador
if (isset($_GET['codigoindicador'])) {
    $codigo_indicador = $_GET['codigoindicador'];
    validaIndicador($location, $rest_key, $codigo_indicador);
} elseif (isset($_GET['preCadastroId'])) {
    $preCadastroId = $_GET['preCadastroId'];
    buscarPreCadastro($location, $rest_key, $preCadastroId);
} else {
   header("location: indisponivel.php");
   exit;
}

// Get pre-filled data from session
$nomePreCadastro = $_SESSION['nomePreCadastro'] ?? '';
$emailPreCadastro = $_SESSION['emailPreCadastro'] ?? '';
$celularPreCadastro = $_SESSION['celularPreCadastro'] ?? '';
$nomeIndicador = $_SESSION['nomeindicador'] ?? 'VitaTop';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitaTop - Cadastro de Distribuidor</title>
    <meta name="description" content="Torne-se um distribuidor independente VitaTop e transforme sua vida financeira">
    <meta name="keywords" content="VitaTop, distribuidor, renda extra, marketing de rede">
    
    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" rel="stylesheet">
    
    <!-- Preconnect for better performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://viacep.com.br">
    
    <!-- Security headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
</head>
<body>
    <!-- Loading overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando...</p>
        </div>
    </div>

    <div class="container">
        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
                <span id="progressText">Etapa 1 de 4</span>
            </div>
        </div>

        <!-- Logo -->
        <div class="logo-container">
            <div class="logo">
                <img src="img/logo.png" width="180px" alt="VitaTop Logo" loading="lazy">
            </div>
            <p class="subtitle">Seja nosso distribuidor independente <?php echo htmlspecialchars($nomeIndicador); ?></p>
        </div>

        <!-- Step 1: Personal Info -->
        <div class="step active" id="step1">
            <div class="step-header">
                <h2>Vamos começar!</h2>
                <p>Conte-nos um pouco sobre você</p>
            </div>

            <form class="form-container" novalidate>
                <!-- Person Type Selection -->
                <div class="person-type-container">
                    <label class="person-type-label">Tipo de cadastro *</label>
                    <div class="person-type-options">
                        <div class="person-type-option active" data-type="F" tabindex="0" role="button" aria-pressed="true">
                            <i class="fas fa-user" aria-hidden="true"></i>
                            <span>Pessoa Física</span>
                        </div>
                        <div class="person-type-option" data-type="J" tabindex="0" role="button" aria-pressed="false">
                            <i class="fas fa-building" aria-hidden="true"></i>
                            <span>Pessoa Jurídica</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="name">Nome completo *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            placeholder="Digite seu nome completo" 
                            value="<?php echo htmlspecialchars($nomePreCadastro); ?>" 
                            required 
                            autocomplete="name"
                            minlength="3"
                            maxlength="100">
                    </div>
                </div>

                <div class="form-group">
                    <label for="document" id="documentLabel">CPF *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-id-card input-icon" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            id="document" 
                            name="document" 
                            placeholder="000.000.000-00" 
                            required 
                            autocomplete="off"
                            inputmode="numeric">
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">E-mail *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope input-icon" aria-hidden="true"></i>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="seu@email.com" 
                            value="<?php echo htmlspecialchars($emailPreCadastro); ?>" 
                            required 
                            autocomplete="email"
                            maxlength="100">
                    </div>
                </div>

                <div class="form-group">
                    <label for="phone">Celular *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-phone input-icon" aria-hidden="true"></i>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            placeholder="(00) 00000-0000" 
                            value="<?php echo htmlspecialchars($celularPreCadastro); ?>" 
                            required 
                            autocomplete="tel"
                            inputmode="numeric">
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">Senha *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon" aria-hidden="true"></i>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Mínimo 8 caracteres, com letras e números" 
                            required 
                            autocomplete="new-password"
                            minlength="8"
                            maxlength="50">
                        <button type="button" class="toggle-password" onclick="togglePassword('password')" aria-label="Mostrar/ocultar senha">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="password-strength" id="passwordStrength" style="display: none;">
                        <div class="strength-bar">
                            <div class="strength-fill" id="strengthFill"></div>
                        </div>
                        <div class="strength-text" id="strengthText"></div>
                        <div class="strength-requirements" id="strengthRequirements"></div>
                    </div>
                </div>

                <button type="button" class="btn-primary" onclick="nextStep()" id="step1Continue">
                    Continuar
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
            </form>
        </div>

        <!-- Step 2: Address Info -->
        <div class="step" id="step2">
            <div class="step-header">
                <h2>Endereço</h2>
                <p>Precisamos saber onde você está</p>
            </div>

            <form class="form-container" novalidate>
                <div class="form-group">
                    <label for="cep">CEP *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-marker-alt input-icon" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            id="cep" 
                            name="cep" 
                            placeholder="00000-000" 
                            required 
                            autocomplete="postal-code"
                            inputmode="numeric"
                            maxlength="9">
                        <div class="loading-spinner" id="cepLoading" style="display: none;">
                            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="street">Rua *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-road input-icon" aria-hidden="true"></i>
                            <input 
                                type="text" 
                                id="street" 
                                name="street" 
                                placeholder="Nome da rua" 
                                required 
                                autocomplete="street-address"
                                maxlength="100">
                        </div>
                    </div>
                    <div class="form-group form-group-small">
                        <label for="number">Número *</label>
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                id="number" 
                                name="number" 
                                placeholder="123" 
                                required 
                                autocomplete="off"
                                maxlength="10">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="complement">Complemento</label>
                    <div class="input-wrapper">
                        <i class="fas fa-plus input-icon" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            id="complement" 
                            name="complement" 
                            placeholder="Apartamento, sala, etc." 
                            autocomplete="off"
                            maxlength="50">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="neighborhood">Bairro *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-map input-icon" aria-hidden="true"></i>
                            <input 
                                type="text" 
                                id="neighborhood" 
                                name="neighborhood" 
                                placeholder="Nome do bairro" 
                                required 
                                autocomplete="off"
                                maxlength="50">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="city">Cidade *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-city input-icon" aria-hidden="true"></i>
                            <input 
                                type="text" 
                                id="city" 
                                name="city" 
                                placeholder="Nome da cidade" 
                                required 
                                autocomplete="address-level2"
                                maxlength="50">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="state">Estado *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-flag input-icon" aria-hidden="true"></i>
                        <select id="state" name="state" required autocomplete="address-level1">
                            <option value="">Selecione o estado</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="prevStep()">
                        <i class="fas fa-arrow-left" aria-hidden="true"></i>
                        Voltar
                    </button>
                    <button type="button" class="btn-primary" onclick="nextStep()" id="step2Continue">
                        Continuar
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </form>
        </div>

        <!-- Step 3: Combo Selection -->
        <div class="step" id="step3">
            <div class="step-header">
                <h2>🎯 Turbine seu sucesso!</h2>
                <p>Escolha um combo e acelere seus resultados desde o primeiro dia</p>
            </div>

            <div class="pnl-container">
                <div class="pnl-message">
                    <h3>💰 Esta é sua chance de MULTIPLICAR seus ganhos!</h3>
                    <p>Nossos combos foram desenvolvidos especialmente para quem quer <strong>resultados extraordinários</strong>. Mais de <span class="highlight">10.000 pessoas</span> já transformaram suas vidas financeiras com essas estratégias!</p>
                    
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-rocket" aria-hidden="true"></i>
                            <span>Acelere seus resultados</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-chart-line" aria-hidden="true"></i>
                            <span>Potencial ilimitado</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-star" aria-hidden="true"></i>
                            <span>Estratégias comprovadas</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span>Oferta por tempo limitado</span>
                        </div>
                    </div>
                    
                    <div class="combo-instruction">
                        <i class="fas fa-info-circle" aria-hidden="true"></i>
                        <span>Clique no combo para selecionar. Clique novamente para desmarcar.</span>
                    </div>
                </div>

                <div class="combos-container">
                    <div class="combos-loading" id="combosLoading">
                        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                        <span>Carregando combos especiais...</span>
                    </div>
                    
                    <div class="swiper combos-swiper" id="combosSwiper" style="display: none;">
                        <div class="swiper-wrapper" id="combosWrapper">
                            <!-- Combos will be loaded here -->
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-next" aria-label="Próximo combo"></div>
                        <div class="swiper-button-prev" aria-label="Combo anterior"></div>
                    </div>

                    <div class="no-combos" id="noCombos" style="display: none;">
                        <i class="fas fa-box-open" aria-hidden="true"></i>
                        <p>Nenhum combo disponível no momento</p>
                    </div>
                </div>

                <div class="selected-combo" id="selectedCombo" style="display: none;">
                    <h4>✅ Combo Selecionado:</h4>
                    <div class="combo-summary">
                        <span class="combo-name" id="selectedComboName"></span>
                        <span class="combo-price" id="selectedComboPrice"></span>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="prevStep()">
                    <i class="fas fa-arrow-left" aria-hidden="true"></i>
                    Voltar
                </button>
                <button type="button" class="btn-primary" onclick="nextStep()" id="continueWithoutCombo">
                    Continuar sem combo
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn-primary btn-combo" onclick="nextStep()" id="continueWithCombo" style="display: none;">
                    Finalizar com combo
                    <i class="fas fa-check" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        <!-- Step 4: Payment (only if combo selected) -->
        <div class="step" id="step4">
            <div class="step-header">
                <h2>💳 Finalizar Pagamento</h2>
                <p>Escolha a forma de pagamento para seu combo</p>
            </div>

            <div class="payment-container">
                <div class="combo-summary-payment">
                    <h4>Resumo do Pedido:</h4>
                    <div class="combo-details">
                        <span class="combo-name-payment" id="comboNamePayment"></span>
                        <span class="combo-price-payment" id="comboPricePayment"></span>
                    </div>
                </div>

                <div class="payment-methods">
                    <h4>Forma de Pagamento:</h4>
                    
                    <!-- PIX -->
                    <div class="payment-method" data-method="pix" tabindex="0" role="button">
                        <div class="payment-header">
                            <i class="fas fa-qrcode" aria-hidden="true"></i>
                            <div class="payment-info">
                                <span class="payment-name">PIX</span>
                                <span class="payment-desc">Pagamento instantâneo</span>
                            </div>
                            <div class="payment-badge">5% OFF</div>
                        </div>
                    </div>

                    <!-- Cartão -->
                    <div class="payment-method" data-method="card" tabindex="0" role="button">
                        <div class="payment-header">
                            <i class="fas fa-credit-card" aria-hidden="true"></i>
                            <div class="payment-info">
                                <span class="payment-name">Cartão de Crédito</span>
                                <span class="payment-desc">Parcelamento em até 12x</span>
                            </div>
                        </div>
                        <div class="payment-details" id="cardDetails" style="display: none;">
                            <div class="form-group">
                                <label for="cardNumber">Número do Cartão *</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-credit-card input-icon" aria-hidden="true"></i>
                                    <input 
                                        type="text" 
                                        id="cardNumber" 
                                        name="cardNumber"
                                        placeholder="0000 0000 0000 0000" 
                                        maxlength="19"
                                        autocomplete="cc-number"
                                        inputmode="numeric">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="cardName">Nome no Cartão *</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-user input-icon" aria-hidden="true"></i>
                                    <input 
                                        type="text" 
                                        id="cardName" 
                                        name="cardName"
                                        placeholder="Nome como está no cartão"
                                        autocomplete="cc-name"
                                        maxlength="50">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cardExpiry">Validade *</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-calendar input-icon" aria-hidden="true"></i>
                                        <input 
                                            type="text" 
                                            id="cardExpiry" 
                                            name="cardExpiry"
                                            placeholder="MM/AA" 
                                            maxlength="5"
                                            autocomplete="cc-exp"
                                            inputmode="numeric">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="cardCVV">CVV *</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-lock input-icon" aria-hidden="true"></i>
                                        <input 
                                            type="text" 
                                            id="cardCVV" 
                                            name="cardCVV"
                                            placeholder="000" 
                                            maxlength="4"
                                            autocomplete="cc-csc"
                                            inputmode="numeric">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="installments">Parcelas</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-list input-icon" aria-hidden="true"></i>
                                    <select id="installments" name="installments">
                                        <option value="1">1x sem juros</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boleto -->
                    <div class="payment-method" data-method="boleto" tabindex="0" role="button">
                        <div class="payment-header">
                            <i class="fas fa-barcode" aria-hidden="true"></i>
                            <div class="payment-info">
                                <span class="payment-name">Boleto Bancário</span>
                                <span class="payment-desc">Vencimento em 3 dias úteis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="prevStep()">
                    <i class="fas fa-arrow-left" aria-hidden="true"></i>
                    Voltar
                </button>
                <button type="button" class="btn-primary" onclick="processPayment()" id="paymentButton">
                    <i class="fas fa-lock" aria-hidden="true"></i>
                    Finalizar Pagamento
                </button>
            </div>
        </div>

        <!-- Success Step -->
        <div class="step success-step" id="successStep">
            <div class="success-animation">
                <div class="success-circle">
                    <i class="fas fa-check success-icon" aria-hidden="true"></i>
                </div>
            </div>
            
            <div class="success-content">
                <h2>Bem-vindo à <?php echo htmlspecialchars($nomeIndicador); ?>!</h2>
                <p id="successMessage">Seu cadastro foi realizado com sucesso</p>
                <div class="success-details">
                    <div class="success-item">
                        <i class="fas fa-envelope" aria-hidden="true"></i>
                        <span>Confirmação enviada para: <strong id="registeredEmail"></strong></span>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-rocket" aria-hidden="true"></i>
                        <span>Sua jornada como distribuidor independente começa agora!</span>
                    </div>
                    <div class="success-item" id="paymentSuccessItem" style="display: none;">
                        <i class="fas fa-credit-card" aria-hidden="true"></i>
                        <span>Pagamento processado com sucesso!</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <a href="https://appvitatop.tecskill.com.br/" class="btn-primary" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                        Acessar Aplicativo
                    </a>
                    <button type="button" class="btn-secondary" onclick="startOver()">
                        <i class="fas fa-redo" aria-hidden="true"></i>
                        Novo cadastro
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/script.js"></script>
    
    <!-- Additional styles for new features -->
    <style>
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        }
        
        .loading-spinner {
            text-align: center;
            color: var(--text-primary);
        }
        
        .loading-spinner i {
            font-size: 32px;
            color: var(--accent);
            margin-bottom: 16px;
            display: block;
        }
        
        .password-strength {
            margin-top: 8px;
            padding: 12px;
            background: var(--secondary);
            border-radius: 8px;
            font-size: 14px;
        }
        
        .strength-bar {
            width: 100%;
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 3px;
        }
        
        .strength-fill.weak {
            background: #ef4444;
            width: 25%;
        }
        
        .strength-fill.fair {
            background: #f59e0b;
            width: 50%;
        }
        
        .strength-fill.good {
            background: #3b82f6;
            width: 75%;
        }
        
        .strength-fill.strong {
            background: #10b981;
            width: 100%;
        }
        
        .strength-text {
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .strength-requirements {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .requirement {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            background: #f1f5f9;
            color: #64748b;
        }
        
        .requirement.met {
            background: #dcfce7;
            color: #166534;
        }
        
        .requirement i {
            font-size: 10px;
        }
        
        /* Enhanced accessibility */
        .person-type-option:focus,
        .payment-method:focus {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
        }
        
        /* Better mobile experience */
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            
            .logo img {
                width: 150px;
            }
            
            .step-header h2 {
                font-size: 20px;
            }
            
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .form-row {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .form-actions {
                grid-template-columns: 1fr;
                gap: 12px;
            }
        }
        
        /* Performance optimizations */
        .combo-card img {
            will-change: transform;
        }
        
        .btn-primary,
        .btn-secondary {
            will-change: transform;
        }
        
        /* Print styles */
        @media print {
            .step:not(.active) {
                display: none;
            }
            
            .btn-primary,
            .btn-secondary {
                display: none;
            }
            
            .progress-container {
                display: none;
            }
        }
    </style>
    
    <!-- Schema.org structured data for SEO -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Cadastro VitaTop",
        "description": "Sistema de cadastro para distribuidores independentes VitaTop",
        "url": "<?php echo $_SERVER['REQUEST_URI']; ?>",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "provider": {
            "@type": "Organization",
            "name": "VitaTop"
        }
    }
    </script>
    
    <!-- Error boundary and fallback -->
    <script>
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
            
            // Show user-friendly error message
            if (!document.querySelector('.error-fallback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-fallback';
                errorDiv.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #ef4444;
                    color: white;
                    padding: 16px;
                    border-radius: 8px;
                    z-index: 10000;
                    max-width: 300px;
                `;
                errorDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Algo deu errado</strong>
                    </div>
                    <p style="margin: 0; font-size: 14px;">Tente recarregar a página. Se o problema persistir, entre em contato conosco.</p>
                    <button onclick="this.parentElement.remove()" style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        padding: 4px;
                    ">×</button>
                `;
                document.body.appendChild(errorDiv);
                
                // Auto remove after 10 seconds
                setTimeout(() => {
                    if (errorDiv.parentElement) {
                        errorDiv.remove();
                    }
                }, 10000);
            }
        });
        
        // Service worker registration for offline support (optional)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    </script>
    
    <!-- Analytics placeholder (replace with your tracking code) -->
    <!-- Google Analytics or other tracking scripts would go here -->
    
</body>
</html>