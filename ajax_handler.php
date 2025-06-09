<?php
// Ajax handler para onboarding completo com checkout integrado
include("funcoes/requisicoes.php");

// Set content type to JSON
header('Content-Type: application/json');

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Function to validate required fields
function validateRequiredFields($data, $requiredFields) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Campo obrigatório faltando: {$field}";
        }
    }
    
    return $errors;
}

// Function to validate email format
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Function to validate CPF
function validateCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    
    if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    
    return true;
}

// Function to validate CNPJ
function validateCNPJ($cnpj) {
    $cnpj = preg_replace('/\D/', '', $cnpj);
    
    if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
        return false;
    }
    
    for ($i = 0, $j = 5, $soma = 0; $i < 12; $i++) {
        $soma += $cnpj[$i] * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    
    $resto = $soma % 11;
    if ($cnpj[12] != ($resto < 2 ? 0 : 11 - $resto)) {
        return false;
    }
    
    for ($i = 0, $j = 6, $soma = 0; $i < 13; $i++) {
        $soma += $cnpj[$i] * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    
    $resto = $soma % 11;
    return $cnpj[13] == ($resto < 2 ? 0 : 11 - $resto);
}

// Function to validate phone number
function validatePhone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 11;
}

// Function to validate CEP
function validateCEP($cep) {
    $cep = preg_replace('/\D/', '', $cep);
    return strlen($cep) == 8;
}

// Function to validate password strength
function validatePassword($password) {
    $errors = [];
    
    if (strlen($password) < 8) {
        $errors[] = 'Senha deve ter no mínimo 8 caracteres';
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Senha deve conter pelo menos uma letra minúscula';
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Senha deve conter pelo menos uma letra maiúscula';
    }
    
    if (!preg_match('/\d/', $password)) {
        $errors[] = 'Senha deve conter pelo menos um número';
    }
    
    return $errors;
}

// Function to sanitize input data
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Function to log errors
function logError($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] ERROR: {$message}";
    if ($data) {
        $logMessage .= " | Data: " . json_encode($data);
    }
    error_log($logMessage);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Sanitize all input data
    $_POST = sanitizeInput($_POST);
    
    // Check if this is a registration request
    if (isset($_POST['action']) && $_POST['action'] === 'register') {
        
        try {
            // Define required fields based on person type
            $requiredFields = [
                'tipoPessoa', 
                'nomeAfiliado', 
                'email', 
                'senha', 
                'celular', 
                'cep', 
                'endereco', 
                'numero', 
                'bairro', 
                'cidade', 
                'estado'
            ];
            
            // Add document field based on person type
            if (isset($_POST['tipoPessoa'])) {
                if ($_POST['tipoPessoa'] === 'F') {
                    $requiredFields[] = 'CPF';
                } else if ($_POST['tipoPessoa'] === 'J') {
                    $requiredFields[] = 'CNPJ';
                }
            }
            
            // Validate required fields
            $fieldErrors = validateRequiredFields($_POST, $requiredFields);
            if (!empty($fieldErrors)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Campos obrigatórios faltando',
                    'errors' => $fieldErrors
                ]);
                exit;
            }
            
            // Validate email format
            if (!validateEmail($_POST['email'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'E-mail inválido'
                ]);
                exit;
            }
            
            // Validate password strength
            $passwordErrors = validatePassword($_POST['senha']);
            if (!empty($passwordErrors)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Senha não atende aos requisitos',
                    'errors' => $passwordErrors
                ]);
                exit;
            }
            
            // Validate document
            if ($_POST['tipoPessoa'] === 'F') {
                if (!validateCPF($_POST['CPF'])) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'CPF inválido'
                    ]);
                    exit;
                }
            } else if ($_POST['tipoPessoa'] === 'J') {
                if (!validateCNPJ($_POST['CNPJ'])) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'CNPJ inválido'
                    ]);
                    exit;
                }
            }
            
            // Validate phone
            if (!validatePhone($_POST['celular'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Telefone inválido'
                ]);
                exit;
            }
            
            // Validate CEP
            if (!validateCEP($_POST['cep'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'CEP inválido'
                ]);
                exit;
            }
            
            // Validate name length
            if (strlen(trim($_POST['nomeAfiliado'])) < 3) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Nome deve ter pelo menos 3 caracteres'
                ]);
                exit;
            }
            
            // Check if product ID is provided
            $produtoId = null;
            if (isset($_POST['idProduto']) && !empty($_POST['idProduto'])) {
                $produtoId = $_POST['idProduto'];
            }

            // Prepare form data
            $formData = [
                'codigoindicador' => $_SESSION['codigo_indicador'] ?? '',
                'idPreCadastro' => $_SESSION['idPreCadastro'] ?? '',
                'tipoPessoa' => $_POST['tipoPessoa'],
                'nomeAfiliado' => trim($_POST['nomeAfiliado']),
                'razaoSocial' => trim($_POST['razaoSocial'] ?? ''),
                'dataNascimento' => $_POST['dataNascimento'] ?? '',
                'genero' => $_POST['genero'] ?? '',
                'CPF' => preg_replace('/\D/', '', $_POST['CPF'] ?? ''),
                'RG' => $_POST['RG'] ?? '',
                'CNPJ' => preg_replace('/\D/', '', $_POST['CNPJ'] ?? ''),
                'inscEstadual' => $_POST['inscEstadual'] ?? '',
                'email' => trim($_POST['email']),
                'senha' => $_POST['senha'],
                'resenha' => $_POST['resenha'] ?? $_POST['senha'],
                'telefone' => $_POST['telefone'] ?? '',
                'celular' => preg_replace('/\D/', '', $_POST['celular']),
                'cep' => preg_replace('/\D/', '', $_POST['cep']),
                'endereco' => trim($_POST['endereco']),
                'numero' => trim($_POST['numero']),
                'complemento' => trim($_POST['complemento'] ?? ''),
                'bairro' => trim($_POST['bairro']),
                'cidade' => trim($_POST['cidade']),
                'estado' => trim($_POST['estado']),
            ];
            
            // Additional validation: Check if session has indicator code
            if (empty($formData['codigoindicador'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Sessão inválida. Recarregue a página.'
                ]);
                exit;
            }

            // Process registration
            $response = processarFormulario($location, $rest_key, $formData);
            
            if ($response['status'] === 'success') {
                // Store email in session for success page
                $_SESSION['email'] = $_POST['email'];
                
                // Prepare response data
                $responseData = [
                    'status' => 'success',
                    'message' => 'Cadastro realizado com sucesso!'
                ];
                
                // If we have registration data with pessoa_id and endereco_id, include it
                if (isset($response['data']['data'])) {
                    $responseData['data'] = $response['data']['data'];
                }
                
                if ($produtoId) {
                    $_SESSION['produtoId'] = $produtoId;
                    $_SESSION['pessoaId'] = $response['data']['data']['pessoa_id'] ?? null;
                    
                    $responseData['redirect'] = 'payment';
                    $responseData['message'] = 'Cadastro realizado com sucesso! Redirecionando para pagamento...';
                } else {
                    $responseData['redirect'] = 'success';
                }
                
                echo json_encode($responseData);
                
            } else {
                // Log the error for debugging
                logError('Registration error', $response);
                
                echo json_encode([
                    'status' => 'error',
                    'message' => isset($response['message']) ? $response['message'] : 'Erro desconhecido no cadastro'
                ]);
            }
            
        } catch (Exception $e) {
            // Log the exception
            logError('Registration exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno do servidor. Tente novamente.'
            ]);
        }
    } 
    // Check if this is a payment processing request
    else if (isset($_POST['action']) && $_POST['action'] === 'process_payment') {
        
        try {
            // Validate required payment fields
            $requiredPaymentFields = ['paymentMethod', 'comboId', 'valor'];
            
            $fieldErrors = validateRequiredFields($_POST, $requiredPaymentFields);
            if (!empty($fieldErrors)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Dados de pagamento incompletos',
                    'errors' => $fieldErrors
                ]);
                exit;
            }
            
            // Validate payment method
            $validMethods = ['pix', 'card', 'boleto'];
            if (!in_array($_POST['paymentMethod'], $validMethods)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Método de pagamento inválido'
                ]);
                exit;
            }
            
            // Validate valor (price)
            $valor = floatval($_POST['valor']);
            if ($valor <= 0) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valor inválido'
                ]);
                exit;
            }
            
            // Additional validation for card payments
            if ($_POST['paymentMethod'] === 'card') {
                $requiredCardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
                
                foreach ($requiredCardFields as $field) {
                    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Dados do cartão incompletos'
                        ]);
                        exit;
                    }
                }
                
                // Validate card number
                $cardNumber = preg_replace('/\D/', '', $_POST['cardNumber']);
                if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Número do cartão inválido'
                    ]);
                    exit;
                }
                
                // Validate expiry date
                if (!preg_match('/^\d{2}\/\d{2}$/', $_POST['cardExpiry'])) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Data de validade inválida'
                    ]);
                    exit;
                }
                
                // Check if card is not expired
                list($month, $year) = explode('/', $_POST['cardExpiry']);
                $expiryDate = new DateTime('20' . $year . '-' . $month . '-01');
                $currentDate = new DateTime();
                
                if ($expiryDate < $currentDate) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Cartão expirado'
                    ]);
                    exit;
                }
                
                // Validate CVV
                $cvv = preg_replace('/\D/', '', $_POST['cardCVV']);
                if (strlen($cvv) < 3 || strlen($cvv) > 4) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'CVV inválido'
                    ]);
                    exit;
                }
            }
            
            // Validate pessoa_id and endereco_id if provided
            $pessoaId = $_POST['pessoaId'] ?? $_SESSION['pessoaId'] ?? null;
            $enderecoId = $_POST['enderecoId'] ?? null;
            
            if (!$pessoaId) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID da pessoa não encontrado'
                ]);
                exit;
            }
            
            // Prepare payment data
            $paymentData = [
                'pessoaId' => $pessoaId,
                'enderecoId' => $enderecoId,
                'comboId' => $_POST['comboId'],
                'paymentMethod' => $_POST['paymentMethod'],
                'valor' => $valor
            ];
            
            // Add card data if needed
            if ($_POST['paymentMethod'] === 'card') {
                $paymentData['cardData'] = [
                    'number' => preg_replace('/\D/', '', $_POST['cardNumber']),
                    'name' => trim($_POST['cardName']),
                    'expiry' => $_POST['cardExpiry'],
                    'cvv' => preg_replace('/\D/', '', $_POST['cardCVV']),
                    'installments' => $_POST['installments'] ?? 1
                ];
                
                // Validate installments
                $installments = intval($paymentData['cardData']['installments']);
                if ($installments < 1 || $installments > 12) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Número de parcelas inválido'
                    ]);
                    exit;
                }
                
                // Check minimum installment value
                $installmentValue = $valor / $installments;
                if ($installmentValue < 10 && $installments > 1) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Valor mínimo da parcela é R$ 10,00'
                    ]);
                    exit;
                }
            }
            
            // Process payment
            $response = processarPagamento($location, $rest_key, $paymentData);
            
            if ($response['status'] === 'success') {
                // Clear session data after successful payment
                unset($_SESSION['produtoId']);
                unset($_SESSION['pessoaId']);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Pagamento processado com sucesso!',
                    'data' => $response['data'] ?? []
                ]);
            } else {
                logError('Payment error', $response);
                
                echo json_encode([
                    'status' => 'error',
                    'message' => $response['message'] ?? 'Erro ao processar pagamento'
                ]);
            }
            
        } catch (Exception $e) {
            logError('Payment exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno no processamento do pagamento'
            ]);
        }
    }
    // Check if this is a combo validation request
    else if (isset($_POST['action']) && $_POST['action'] === 'validate_combo') {
        
        try {
            $comboId = $_POST['comboId'] ?? null;
            
            if (!$comboId) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID do combo não fornecido'
                ]);
                exit;
            }
            
            // Get combo details to validate
            $combosResponse = buscarCombos($location, $rest_key);
            
            if ($combosResponse['status'] === 'success' && !empty($combosResponse['data'])) {
                $comboFound = false;
                foreach ($combosResponse['data'] as $combo) {
                    if ($combo['id'] == $comboId) {
                        $comboFound = true;
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Combo válido',
                            'data' => $combo
                        ]);
                        break;
                    }
                }
                
                if (!$comboFound) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Combo não encontrado'
                    ]);
                }
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Erro ao validar combo'
                ]);
            }
            
        } catch (Exception $e) {
            logError('Combo validation exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro na validação do combo'
            ]);
        }
    }
    // Check if this is a session validation request
    else if (isset($_POST['action']) && $_POST['action'] === 'validate_session') {
        
        try {
            $sessionValid = !empty($_SESSION['codigo_indicador']);
            
            echo json_encode([
                'status' => 'success',
                'valid' => $sessionValid,
                'data' => [
                    'codigo_indicador' => $_SESSION['codigo_indicador'] ?? null,
                    'nomeindicador' => $_SESSION['nomeindicador'] ?? null,
                    'idPreCadastro' => $_SESSION['idPreCadastro'] ?? null,
                    'nomePreCadastro' => $_SESSION['nomePreCadastro'] ?? null,
                    'emailPreCadastro' => $_SESSION['emailPreCadastro'] ?? null,
                    'celularPreCadastro' => $_SESSION['celularPreCadastro'] ?? null
                ]
            ]);
            
        } catch (Exception $e) {
            logError('Session validation exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro na validação da sessão'
            ]);
        }
    }
    // Check if this is a CEP lookup request
    else if (isset($_POST['action']) && $_POST['action'] === 'lookup_cep') {
        
        try {
            $cep = preg_replace('/\D/', '', $_POST['cep'] ?? '');
            
            if (strlen($cep) !== 8) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'CEP inválido'
                ]);
                exit;
            }
            
            // Use ViaCEP API
            $viaCepUrl = "https://viacep.com.br/ws/{$cep}/json/";
            $response = file_get_contents($viaCepUrl);
            
            if ($response === false) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Erro ao consultar CEP'
                ]);
                exit;
            }
            
            $data = json_decode($response, true);
            
            if (isset($data['erro'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'CEP não encontrado'
                ]);
            } else {
                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'cep' => $data['cep'],
                        'logradouro' => $data['logradouro'],
                        'complemento' => $data['complemento'],
                        'bairro' => $data['bairro'],
                        'localidade' => $data['localidade'],
                        'uf' => $data['uf'],
                        'ibge' => $data['ibge'],
                        'gia' => $data['gia'],
                        'ddd' => $data['ddd'],
                        'siafi' => $data['siafi']
                    ]
                ]);
            }
            
        } catch (Exception $e) {
            logError('CEP lookup exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro na consulta do CEP'
            ]);
        }
    }
    // Check if this is a password strength check
    else if (isset($_POST['action']) && $_POST['action'] === 'check_password') {
        
        try {
            $password = $_POST['password'] ?? '';
            $errors = validatePassword($password);
            
            $strength = 0;
            $feedback = [];
            
            if (strlen($password) >= 8) {
                $strength += 25;
            } else {
                $feedback[] = 'Mínimo 8 caracteres';
            }
            
            if (preg_match('/[a-z]/', $password)) {
                $strength += 25;
            } else {
                $feedback[] = 'Letra minúscula';
            }
            
            if (preg_match('/[A-Z]/', $password)) {
                $strength += 25;
            } else {
                $feedback[] = 'Letra maiúscula';
            }
            
            if (preg_match('/\d/', $password)) {
                $strength += 25;
            } else {
                $feedback[] = 'Número';
            }
            
            $strengthLabel = 'Muito fraca';
            if ($strength >= 75) $strengthLabel = 'Forte';
            else if ($strength >= 50) $strengthLabel = 'Média';
            else if ($strength >= 25) $strengthLabel = 'Fraca';
            
            echo json_encode([
                'status' => 'success',
                'strength' => $strength,
                'label' => $strengthLabel,
                'valid' => empty($errors),
                'feedback' => $feedback,
                'errors' => $errors
            ]);
            
        } catch (Exception $e) {
            logError('Password check exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro na verificação da senha'
            ]);
        }
    }
    // Invalid action
    else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Ação não reconhecida',
            'received_action' => $_POST['action'] ?? 'none'
        ]);
    }
    
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Handle GET requests for specific endpoints
    if (isset($_GET['action'])) {
        
        switch ($_GET['action']) {
            case 'get_session_data':
                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'codigo_indicador' => $_SESSION['codigo_indicador'] ?? null,
                        'nomeindicador' => $_SESSION['nomeindicador'] ?? null,
                        'idPreCadastro' => $_SESSION['idPreCadastro'] ?? null,
                        'nomePreCadastro' => $_SESSION['nomePreCadastro'] ?? null,
                        'emailPreCadastro' => $_SESSION['emailPreCadastro'] ?? null,
                        'celularPreCadastro' => $_SESSION['celularPreCadastro'] ?? null
                    ]
                ]);
                break;
                
            case 'get_combos':
                try {
                    $response = buscarCombos($location, $rest_key);
                    echo json_encode($response);
                } catch (Exception $e) {
                    logError('Get combos exception: ' . $e->getMessage());
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Erro ao buscar combos'
                    ]);
                }
                break;
                
            case 'health_check':
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Sistema operacional',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'session_active' => !empty($_SESSION['codigo_indicador'])
                ]);
                break;
                
            default:
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Ação GET não reconhecida'
                ]);
        }
        
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Parâmetro action obrigatório para requisições GET'
        ]);
    }
    
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido',
        'allowed_methods' => ['POST', 'GET']
    ]);
}

// Function to handle errors gracefully
function handleError($errno, $errstr, $errfile, $errline) {
    $error = [
        'type' => 'PHP Error',
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    
    logError('PHP Error occurred', $error);
    
    // Don't output anything if headers already sent
    if (!headers_sent()) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro interno do servidor'
        ]);
    }
    
    return true;
}

// Set error handler
set_error_handler('handleError');

// Function to handle fatal errors
function handleFatalError() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        logError('Fatal error occurred', $error);
        
        if (!headers_sent()) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro fatal no servidor'
            ]);
        }
    }
}

// Register shutdown function
register_shutdown_function('handleFatalError');
?>