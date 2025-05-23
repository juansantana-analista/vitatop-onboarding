<?php
include("funcoes/requisicoes.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['documento']) && isset($_POST['tipoPessoa'])) {
        $documento = trim($_POST['documento']);
        $tipoPessoa = trim($_POST['tipoPessoa']);

        if (empty($documento)) {
            header("HTTP/1.1 400 Bad Request");
            echo 'erro1';
            exit();
        }

        if (empty($tipoPessoa) || !in_array($tipoPessoa, ['F', 'J'])) {
            header("HTTP/1.1 400 Bad Request");
            echo 'erro2';
            exit();
        }

        $documentoLimpo = preg_replace('/\D/', '', $documento);

        if ($tipoPessoa === 'F' && strlen($documentoLimpo) !== 11) {
            echo 'erro3';
            exit();
        }

        if ($tipoPessoa === 'J' && strlen($documentoLimpo) !== 14) {
            echo 'erro4';
            exit();
        }

        $formData = [
            'tipo' => $tipoPessoa,
            'documento' => $documentoLimpo,
        ];

        try {
            $response = verificarCpf($location, $rest_key, $formData);

            if (!isset($response['data']['message'])) {
                echo 'erro6';
                exit();
            }

            $mensagem = strtolower($response['data']['message']);
            if (strpos($mensagem, 'já se encontra cadastrado') !== false) {
                echo 'erro5';
            } elseif (strpos($mensagem, 'pode ser cadastrado') !== false) {
                echo 'sucesso';
            } else {
                echo 'erro6';
            }
        } catch (Exception $e) {
            echo 'erro6';
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo 'erro';
        exit();
    }
} else {
    header("HTTP/1.1 405 Method Not Allowed");
    echo 'erro';
    exit();
}
?>
