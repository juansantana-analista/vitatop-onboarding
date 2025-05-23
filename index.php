<?php
include("funcoes/requisicoes.php");
// Validação do indicador
if (isset($_GET['codigoindicador'])) {
    $codigo_indicador = $_GET['codigoindicador'];

    validaIndicador($location, $rest_key, $codigo_indicador);
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
    <title>AffiliateHub - Cadastro</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
                <span id="progressText">Etapa 1 de 2</span>
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
                        <input type="text" id="name" name="name" placeholder="Digite seu nome completo" required>
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
                        <input type="email" id="email" name="email" placeholder="seu@email.com" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="phone">Celular *</label>
                    <div class="input-wrapper">
                        <i class="fas fa-phone input-icon"></i>
                        <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" required>
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
                    <button type="button" class="btn-primary" onclick="finishRegistration()">
                        Finalizar cadastro
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </form>
        </div>

        <!-- Success Step -->
        <div class="step success-step" id="successStep">
            <div class="success-animation">
                <div class="success-circle">
                    <i class="fas fa-check success-icon"></i>
                </div>
            </div>
            
            <div class="success-content">
                <h2>Bem-vindo à AffiliateHub!</h2>
                <p>Seu cadastro foi realizado com sucesso</p>
                <div class="success-details">
                    <div class="success-item">
                        <i class="fas fa-envelope"></i>
                        <span>Confirmação enviada para: <strong id="registeredEmail"></strong></span>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-rocket"></i>
                        <span>Sua jornada como afiliado começa agora!</span>
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

    <script src="js/config.js"></script>
    <script src="js/script.js"></script>
</body>
</html>