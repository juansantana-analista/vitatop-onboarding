<?php
include("funcoes/requisicoes.php");

// Set content type to JSON
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $response = buscarCombos($location, $rest_key);
        
        if ($response && isset($response['status']) && $response['status'] === 'success') {
            echo json_encode([
                'status' => 'success',
                'data' => $response['data'] ?? []
            ]);
        } else {
            // Se não há combos ou erro, retorna lista vazia
            echo json_encode([
                'status' => 'success',
                'data' => []
            ]);
        }
    } catch (Exception $e) {
        error_log('Erro ao buscar combos: ' . $e->getMessage());
        
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao carregar combos'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido'
    ]);
}
?>