<?php
include("funcoes/requisicoes.php");

// Set content type to JSON for better error handling
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['documento']) && isset($_POST['tipoPessoa'])) {
        $documento = trim($_POST['documento']);
        $tipoPessoa = trim($_POST['tipoPessoa']);

        // Validate basic input
        if (empty($documento)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Documento é obrigatório',
                'code' => 'DOCUMENTO_VAZIO'
            ]);
            exit();
        }

        if (empty($tipoPessoa) || !in_array($tipoPessoa, ['F', 'J'])) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Tipo de pessoa inválido',
                'code' => 'TIPO_INVALIDO'
            ]);
            exit();
        }

        // Clean document (remove non-numeric characters)
        $documentoLimpo = preg_replace('/\D/', '', $documento);

        // Validate document length
        if ($tipoPessoa === 'F' && strlen($documentoLimpo) !== 11) {
            echo json_encode([
                'status' => 'error',
                'message' => 'CPF deve ter 11 dígitos',
                'code' => 'CPF_TAMANHO_INVALIDO'
            ]);
            exit();
        }

        if ($tipoPessoa === 'J' && strlen($documentoLimpo) !== 14) {
            echo json_encode([
                'status' => 'error',
                'message' => 'CNPJ deve ter 14 dígitos',
                'code' => 'CNPJ_TAMANHO_INVALIDO'
            ]);
            exit();
        }

        // Prepare data for API call
        $formData = [
            'tipo' => $tipoPessoa,
            'documento' => $documentoLimpo,
        ];

        try {
            // Call the verification function from requisicoes.php
            $response = verificarCpf($location, $rest_key, $formData);

            // Check if response has the expected structure
            if (!isset($response['data']['message'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Erro na comunicação com o servidor',
                    'code' => 'RESPOSTA_INVALIDA'
                ]);
                exit();
            }

            // Process the response message
            $mensagem = strtolower($response['data']['message']);
            
            if (strpos($mensagem, 'já se encontra cadastrado') !== false || 
                strpos($mensagem, 'já está cadastrado') !== false ||
                strpos($mensagem, 'existe') !== false) {
                // Document already exists
                echo json_encode([
                    'status' => 'error',
                    'message' => $tipoPessoa === 'F' ? 'Este CPF já está cadastrado' : 'Este CNPJ já está cadastrado',
                    'code' => 'DOCUMENTO_EXISTE'
                ]);
            } elseif (strpos($mensagem, 'pode ser cadastrado') !== false ||
                     strpos($mensagem, 'disponível') !== false ||
                     strpos($mensagem, 'sucesso') !== false) {
                // Document available for registration
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Documento disponível para cadastro',
                    'code' => 'DOCUMENTO_DISPONIVEL'
                ]);
            } else {
                // Unknown response
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Resposta não reconhecida do servidor',
                    'code' => 'RESPOSTA_DESCONHECIDA',
                    'debug_message' => $response['data']['message'] // For debugging
                ]);
            }
            
        } catch (Exception $e) {
            // Log the error
            error_log('Erro na verificação de documento: ' . $e->getMessage());
            
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno na verificação. Tente novamente.',
                'code' => 'ERRO_INTERNO'
            ]);
        }
    } else {
        // Missing required parameters
        echo json_encode([
            'status' => 'error',
            'message' => 'Parâmetros obrigatórios: documento e tipoPessoa',
            'code' => 'PARAMETROS_FALTANDO'
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