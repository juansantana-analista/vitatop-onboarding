<?php
include("funcoes/requisicoes.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifica se 'documento' e 'tipoPessoa' estão definidos e não estão vazios
    if (isset($_POST['email'])) {
        $email = $_POST['email'];

        $formData = [
            'email' => $email,
        ];

        $response = verificarEmail($location, $rest_key, $formData);

        if ($response['data']['status'] !== 'success') {
            echo 'erro';
        } else {
            // Exibe mensagem de sucesso
            echo 'sucesso';
        }
    } else {
        // Responde com erro 403 se 'documento' ou 'tipoPessoa' não estiverem definidos ou estiverem vazios
        header("HTTP/1.1 403 Forbidden");
        exit();
    }
} else {
    // Responde com erro 403 se o método não for POST
    header("HTTP/1.1 403 Forbidden");
    exit();
}
