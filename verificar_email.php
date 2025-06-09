<?php
include("funcoes/requisicoes.php");

// Set content type to JSON for better error handling
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['email'])) {
        $email = trim($_POST['email']);

        // Validate basic input
        if (empty($email)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'E-mail é obrigatório',
                'code' => 'EMAIL_VAZIO'
            ]);
            exit();
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Formato de e-mail inválido',
                'code' => 'EMAIL_FORMATO_INVALIDO'
            ]);
            exit();
        }

        // Prepare data for API call
        $formData = [
            'email' => $email,
        ];

        try {
            // Call the verification function from requisicoes.php
            $response = verificarEmail($location, $rest_key, $formData);

            // Check if response has the expected structure
            if (!isset($response['data'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Erro na comunicação com o servidor',
                    'code' => 'RESPOSTA_INVALIDA'
                ]);
                exit();
            }

            // Process the response
            if ($response['data']['status'] === 'success') {
                // Email available for registration
                echo json_encode([
                    'status' => 'success',
                    'message' => 'E-mail disponível para cadastro',
                    'code' => 'EMAIL_DISPONIVEL'
                ]);
            } else {
                // Email already exists or other error
                $message = $response['data']['message'] ?? 'E-mail já está cadastrado';
                
                // Check for specific error messages
                if (strpos(strtolower($message), 'já cadastrado') !== false ||
                    strpos(strtolower($message), 'existe') !== false ||
                    strpos(strtolower($message), 'já está') !== false) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Este e-mail já está cadastrado',
                        'code' => 'EMAIL_EXISTE'
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => $message,
                        'code' => 'ERRO_VERIFICACAO'
                    ]);
                }
            }
            
        } catch (Exception $e) {
            // Log the error
            error_log('Erro na verificação de email: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno na verificação. Tente novamente.',
                'code' => 'ERRO_INTERNO'
            ]);
        }
    } else {
        // Missing required parameter
        echo json_encode([
            'status' => 'error',
            'message' => 'Parâmetro obrigatório: email',
            'code' => 'PARAMETRO_FALTANDO'
        ]);
        exit();
    }
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido. Use POST.',
        'code' => 'METODO_INVALIDO'
    ]);
    exit();
}
?>