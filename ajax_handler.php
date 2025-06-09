<?php
// Ajax handler for returning JSON responses instead of redirects
include("funcoes/requisicoes.php");

// Set content type to JSON
header('Content-Type: application/json');

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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if this is a registration request
    if (isset($_POST['action']) && $_POST['action'] === 'register') {
        
        // Define required fields
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
                'message' => 'Campos obrigatórios faltando: ' . implode(', ', $fieldErrors)
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
        
        // Validate password length
        if (strlen($_POST['senha']) < 8) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Senha deve ter no mínimo 8 caracteres'
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
        try {
            $response = processarFormulario($location, $rest_key, $formData);
            
            if ($response['status'] === 'success') {
                // Store email in session for success page
                $_SESSION['email'] = $_POST['email'];
                
                // Return registration success with user IDs
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Cadastro realizado com sucesso!',
                    'data' => $response['data'] ?? []
                ]);
            } else {
                // Log the error for debugging
                error_log('Registration error: ' . print_r($response, true));
                
                echo json_encode([
                    'status' => 'error',
                    'message' => isset($response['message']) ? $response['message'] : 'Erro desconhecido no cadastro'
                ]);
            }
        } catch (Exception $e) {
            // Log the exception
            error_log('Registration exception: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno do servidor. Tente novamente.'
            ]);
        }
    } 
    // Check if this is a payment processing request
        else if (isset($_POST['action']) && $_POST['action'] === 'process_payment') {
        
        // LOG: Dados recebidos do frontend
        error_log('🔄 AJAX HANDLER - DADOS RECEBIDOS:');
        error_log('- Pessoa ID: ' . ($_POST['pessoaId'] ?? 'N/A'));
        error_log('- Endereço ID: ' . ($_POST['enderecoId'] ?? 'N/A'));
        error_log('- Combo ID: ' . ($_POST['comboId'] ?? 'N/A'));
        error_log('- Método Pagamento: ' . ($_POST['paymentMethod'] ?? 'N/A'));
        error_log('- Valor: ' . ($_POST['valor'] ?? 'N/A'));
        error_log('- POST completo: ' . print_r($_POST, true));
        
        // Validate required payment fields
        $requiredPaymentFields = ['paymentMethod', 'pessoaId', 'comboId'];
        
        $fieldErrors = validateRequiredFields($_POST, $requiredPaymentFields);
        if (!empty($fieldErrors)) {
            error_log('❌ ERRO - Campos obrigatórios faltando: ' . implode(', ', $fieldErrors));
            echo json_encode([
                'status' => 'error',
                'message' => 'Dados de pagamento incompletos'
            ]);
            exit;
        }
        
        // Validate payment method
        $validMethods = ['pix', 'card', 'boleto'];
        if (!in_array($_POST['paymentMethod'], $validMethods)) {
            error_log('❌ ERRO - Método de pagamento inválido: ' . $_POST['paymentMethod']);
            echo json_encode([
                'status' => 'error',
                'message' => 'Método de pagamento inválido'
            ]);
            exit;
        }
        
        // Additional validation for card payments
        if ($_POST['paymentMethod'] === 'card') {
            $requiredCardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
            
            foreach ($requiredCardFields as $field) {
                if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
                    error_log('❌ ERRO - Dados do cartão incompletos. Campo faltando: ' . $field);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Dados do cartão incompletos'
                    ]);
                    exit;
                }
            }
        }
        
        // Prepare payment data with user information
        $paymentData = [
            'pessoa_id' => $_POST['pessoaId'],
            'endereco_entrega_id' => $_POST['enderecoId'] ?? null,
            'produto_id' => $_POST['comboId'],
            'opcao_pagamento' => $_POST['paymentMethod'],
            'valor' => $_POST['valor'] ?? 0
        ];
        
        // Add card data if needed
        if ($_POST['paymentMethod'] === 'card') {
            $paymentData['cardData'] = [
                'numero_cartao' => preg_replace('/\D/', '', $_POST['cardNumber']),
                'nome_cartao' => trim($_POST['cardName']),
                'validade_cartao' => $_POST['cardExpiry'],
                'cvc_cartao' => $_POST['cardCVV'],
                'installments' => $_POST['installments'] ?? 1
            ];
            
            error_log('💳 DADOS DO CARTÃO PREPARADOS:');
            error_log('- Número: ' . substr($paymentData['cardData']['numero_cartao'], 0, 6) . '****');
            error_log('- Nome: ' . $paymentData['cardData']['nome_cartao']);
            error_log('- Parcelas: ' . $paymentData['cardData']['installments']);
        }
        
        // LOG: Dados preparados para enviar para a API
        error_log('📤 DADOS PREPARADOS PARA API:');
        error_log(print_r($paymentData, true));
        
        try {
            $response = processarPagamento($location, $rest_key, $paymentData);
            
            // LOG: Resposta completa da API
            error_log('📥 RESPOSTA COMPLETA DA API SAFE2PAY:');
            error_log(print_r($response, true));
            
            if ($response['status'] === 'success') {
                error_log('✅ PAGAMENTO PROCESSADO COM SUCESSO');
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Pagamento processado com sucesso!',
                    'data' => $response['data'] ?? []
                ]);
            } else {
                error_log('❌ ERRO NO PAGAMENTO:');
                error_log('- Status: ' . ($response['status'] ?? 'N/A'));
                error_log('- Message: ' . ($response['message'] ?? 'N/A'));
                error_log('- Data: ' . print_r($response['data'] ?? [], true));
                
                echo json_encode([
                    'status' => 'error',
                    'message' => $response['message'] ?? 'Erro ao processar pagamento'
                ]);
            }
        } catch (Exception $e) {
            error_log('❌ EXCEPTION NO PROCESSAMENTO DE PAGAMENTO:');
            error_log('- Message: ' . $e->getMessage());
            error_log('- File: ' . $e->getFile());
            error_log('- Line: ' . $e->getLine());
            error_log('- Trace: ' . $e->getTraceAsString());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno no processamento do pagamento'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Ação não reconhecida'
        ]);
    }
} else {
    // Método não permitido
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido'
    ]);
}
?>