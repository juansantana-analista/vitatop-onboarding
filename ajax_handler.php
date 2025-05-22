<?php
// Ajax handler for returning JSON responses instead of redirects
include("funcoes/requisicoes.php");

// Set content type to JSON
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if this is a registration request
    if (isset($_POST['action']) && $_POST['action'] === 'register') {
        
        // Verifica se 'idProduto' está definido e não está vazio
        if (isset($_POST['idProduto']) && !empty($_POST['idProduto'])) {
            $produtoId = $_POST['idProduto'];
        } else {
            $produtoId = null;
        }

        $formData = [
            'codigoindicador' => $_SESSION['codigo_indicador'],
            'tipoPessoa' => $_POST['tipoPessoa'],
            'nomeAfiliado' => $_POST['nomeAfiliado'],
            'razaoSocial' => $_POST['razaoSocial'],
            'dataNascimento' => '', // You might want to add this field to the form
            'genero' => '', // You might want to add this field to the form
            'CPF' => $_POST['CPF'],
            'RG' => $_POST['RG'],
            'CNPJ' => $_POST['CNPJ'],
            'inscEstadual' => $_POST['inscEstadual'],
            'email' => $_POST['email'],
            'senha' => $_POST['senha'],
            'resenha' => $_POST['resenha'],
            'telefone' => $_POST['telefone'],
            'celular' => $_POST['celular'],
            'cep' => $_POST['cep'],
            'endereco' => $_POST['endereco'],
            'numero' => $_POST['numero'],
            'complemento' => $_POST['complemento'],
            'bairro' => $_POST['bairro'],
            'cidade' => $_POST['cidade'],
            'estado' => $_POST['estado'],
        ];

        $response = processarFormulario($location, $rest_key, $formData);
        
        if ($response['status'] === 'success') {
            // Store email in session for success page
            $_SESSION['email'] = $_POST['email'];
            
            if ($produtoId) {
                $_SESSION['produtoId'] = $produtoId;
                $_SESSION['pessoaId'] = $response['data']['data']['pessoa_id'];
                
                echo json_encode([
                    'status' => 'success',
                    'redirect' => 'checkout.php',
                    'message' => 'Cadastro realizado com sucesso!'
                ]);
            } else {
                echo json_encode([
                    'status' => 'success',
                    'redirect' => 'sucesso.php',
                    'message' => 'Cadastro realizado com sucesso!'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => isset($response['message']) ? $response['message'] : 'Erro desconhecido no cadastro'
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