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

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitaTop - Cadastro</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" rel="stylesheet">
</head>
<body>
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
                <img src="img/logo.png" width="180px" alt="" srcset="">
            </div>
            <p class="subtitle">Seja nosso distribuidor independente VitaTop</p>
        </div>

        <!-- Step 1: Personal Info -->
        <div class="step active" id="step1">
            <div class="step-header">
                <h2>Vamos começar!</h2>
                <p>Conte-nos um pouco sobre você</p>
            </div>

            <form class="form-container">
                <!-- Person Type Selection -->
                <div class="person-type-container">
                    <label class="person-type-label">Tipo de cadastro</label>
                    <div class="person-type-options">
                        <div class="person-type-option active" data-type="F">
                            <i class="fas fa-user"></i>
                            <span>Pessoa Física</span>
                        </div>
                        <div class="person-type-option" data-type="J">
                            <i class="fas fa-building"></i>
                            <span>Pessoa Jurídica</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="name">Nome completo *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input type="text" id="name" name="name" placeholder="Digite seu nome completo" 
                            value="<?php echo isset($_SESSION['nomePreCadastro']) ? htmlspecialchars($_SESSION['nomePreCadastro']) : ''; ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="document" id="documentLabel">CPF *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-id-card input-icon"></i>
                        <input type="text" id="document" name="document" placeholder="000.000.000-00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="email">E-mail *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope input-icon"></i>
                        <input type="email" id="email" name="email" placeholder="seu@email.com" 
                            value="<?php echo isset($_SESSION['emailPreCadastro']) ? htmlspecialchars($_SESSION['emailPreCadastro']) : ''; ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="phone">Celular *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-phone input-icon"></i>
                        <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" 
                            value="<?php echo isset($_SESSION['celularPreCadastro']) ? htmlspecialchars($_SESSION['celularPreCadastro']) : ''; ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">Senha *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" id="password" name="password" placeholder="Mínimo 8 caracteres" required>
                        <button type="button" class="toggle-password" onclick="togglePassword('password')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="terms-container">
                    <div class="terms-checkbox" id="termsCheckbox">
                        <input type="checkbox" id="acceptTerms" name="acceptTerms" required>
                        <label for="acceptTerms" class="terms-text">
                            Li e aceito os 
                            <span class="terms-link" onclick="openContractModal()">
                                termos e condições do contrato
                            </span>
                        </label>
                    </div>
                </div>
                <button type="button" class="btn-primary" onclick="nextStep()">
                    Continuar
                    <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>

        <!-- Step 2: Address Info -->
        <div class="step" id="step2">
            <div class="step-header">
                <h2>Endereço</h2>
                <p>Precisamos saber onde você está</p>
            </div>

            <form class="form-container">
                <div class="form-group">
                    <label for="cep">CEP *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-marker-alt input-icon"></i>
                        <input type="text" id="cep" name="cep" placeholder="00000-000" required>
                        <div class="loading-spinner" id="cepLoading" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="street">Rua *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-road input-icon"></i>
                            <input type="text" id="street" name="street" placeholder="Nome da rua" required>
                        </div>
                    </div>
                    <div class="form-group form-group-small">
                        <label for="number">Número *</label>
                        <div class="input-wrapper">
                            <input type="text" id="number" name="number" placeholder="123" required>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="complement">Complemento</label>
                    <div class="input-wrapper">
                        <i class="fas fa-plus input-icon"></i>
                        <input type="text" id="complement" name="complement" placeholder="Apartamento, sala, etc.">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="neighborhood">Bairro *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-map input-icon"></i>
                            <input type="text" id="neighborhood" name="neighborhood" placeholder="Nome do bairro" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="city">Cidade *</label>
                        <div class="input-wrapper">
                            <i class="fas fa-city input-icon"></i>
                            <input type="text" id="city" name="city" placeholder="Nome da cidade" required>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="state">Estado *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-flag input-icon"></i>
                        <select id="state" name="state" required>
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
                        <i class="fas fa-arrow-left"></i>
                        Voltar
                    </button>
                    <button type="button" class="btn-primary" onclick="nextStep()">
                        Continuar
                        <i class="fas fa-arrow-right"></i>
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
                            <i class="fas fa-rocket"></i>
                            <span>Acelere seus resultados</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-chart-line"></i>
                            <span>Potencial ilimitado</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-star"></i>
                            <span>Estratégias comprovadas</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-clock"></i>
                            <span>Oferta por tempo limitado</span>
                        </div>
                    </div>
                    
                    <div class="combo-instruction">
                        <i class="fas fa-info-circle"></i>
                        <span>Clique no combo para selecionar. Clique novamente para desmarcar.</span>
                    </div>
                </div>

                <div class="combos-container">
                    <div class="combos-loading" id="combosLoading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Carregando combos especiais...</span>
                    </div>
                    
                    <div class="swiper combos-swiper" id="combosSwiper" style="display: none;">
                        <div class="swiper-wrapper" id="combosWrapper">
                            <!-- Combos will be loaded here -->
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
                    </div>

                    <div class="no-combos" id="noCombos" style="display: none;">
                        <i class="fas fa-box-open"></i>
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
                    <i class="fas fa-arrow-left"></i>
                    Voltar
                </button>
                <button type="button" class="btn-primary" onclick="nextStep()" id="continueWithoutCombo">
                    Continuar sem combo
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button type="button" class="btn-primary btn-combo" onclick="nextStep()" id="continueWithCombo" style="display: none;">
                    Finalizar com combo
                    <i class="fas fa-check"></i>
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
                    <div class="payment-method" data-method="pix">
                        <div class="payment-header">
                            <i class="fas fa-qrcode"></i>
                            <div class="payment-info">
                                <span class="payment-name">PIX</span>
                                <span class="payment-desc">Pagamento instantâneo</span>
                            </div>
                            <div class="payment-badge">5% OFF</div>
                        </div>
                    </div>

                    <!-- Cartão -->
                    <div class="payment-method" data-method="card">
                        <div class="payment-header">
                            <i class="fas fa-credit-card"></i>
                            <div class="payment-info">
                                <span class="payment-name">Cartão de Crédito</span>
                                <span class="payment-desc">Parcelamento em até 12x</span>
                            </div>
                        </div>
                        <div class="payment-details" id="cardDetails" style="display: none;">
                            <div class="form-group">
                                <label>Número do Cartão *</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-credit-card input-icon"></i>
                                    <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Nome no Cartão *</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-user input-icon"></i>
                                    <input type="text" id="cardName" placeholder="Nome como está no cartão">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Validade *</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-calendar input-icon"></i>
                                        <input type="text" id="cardExpiry" placeholder="MM/AA" maxlength="5">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>CVV *</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-lock input-icon"></i>
                                        <input type="text" id="cardCVV" placeholder="000" maxlength="4">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Parcelas</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-list input-icon"></i>
                                    <select id="installments">
                                        <option value="1">1x sem juros</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boleto -->
                    <div class="payment-method" data-method="boleto">
                        <div class="payment-header">
                            <i class="fas fa-barcode"></i>
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
                    <i class="fas fa-arrow-left"></i>
                    Voltar
                </button>
                <button type="button" class="btn-primary" onclick="processPayment()" id="paymentButton">
                    <i class="fas fa-lock"></i>
                    Finalizar Pagamento
                </button>
            </div>
        </div>

        <!-- Success Step -->
        <div class="step success-step" id="successStep">
            <div class="success-animation">
                <div class="success-circle">
                    <i class="fas fa-check success-icon"></i>
                </div>
            </div>
            
            <div class="success-content">
                <h2>Bem-vindo à VitaTop!</h2>
                <p id="successMessage">Seu cadastro foi realizado com sucesso</p>
                <div class="success-details">
                    <div class="success-item">
                        <i class="fas fa-envelope"></i>
                        <span>Confirmação enviada para: <strong id="registeredEmail"></strong></span>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-rocket"></i>
                        <span>Sua jornada como distribuidor começa agora!</span>
                    </div>
                    <div class="success-item" id="paymentSuccessItem" style="display: none;">
                        <i class="fas fa-credit-card"></i>
                        <span>Pagamento processado com sucesso!</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <a href="https://appvitatop.tecskill.com.br/" class="btn-primary" >
                        <i class="fas fa-external-link-alt"></i>
                        Acessar Aplicativo
                    </a>
                    <button type="button" class="btn-secondary" onclick="startOver()">
                        <i class="fas fa-redo"></i>
                        Novo cadastro
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- MODAL CONTRATO -->
    <div class="contract-modal" id="contractModal">
        <div class="contract-content">
            <div class="contract-header">
                <h2><i class="fas fa-file-contract"></i> Contrato de Credenciamento</h2>
                <button class="close-btn" onclick="closeContractModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="contract-body">
                <div class="contract-text" id="contractText"></div>
            </div>
            
            <div class="contract-footer">
                <div class="contract-checkbox">
                    <input type="checkbox" id="modalAcceptTerms">
                    <label for="modalAcceptTerms">
                        Li e aceito todos os termos e condições do Contrato de Credenciamento
                    </label>
                </div>
                
                <div class="contract-actions">
                    <button class="btn-cancel" onclick="closeContractModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-accept" id="acceptContractBtn" onclick="acceptContract()">
                        <i class="fas fa-check"></i> Aceitar Termos
                    </button>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/script.js"></script>
</body>
</html>