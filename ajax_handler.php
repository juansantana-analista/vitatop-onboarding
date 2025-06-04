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
        try {
            $response = processarFormulario($location, $rest_key, $formData);
            
            if ($response['status'] === 'success') {
                // Store email in session for success page
                $_SESSION['email'] = $_POST['email'];
                
                if ($produtoId) {
                    $_SESSION['produtoId'] = $produtoId;
                    $_SESSION['pessoaId'] = $response['data']['data']['pessoa_id'] ?? null;
                    
                    echo json_encode([
                        'status' => 'success',
                        'redirect' => 'checkout.php',
                        'message' => 'Cadastro realizado com sucesso!'
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'success',
                        'redirect' => 'https://appvitatop.tecskill.com.br/',
                        'message' => 'Cadastro realizado com sucesso!'
                    ]);
                }
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