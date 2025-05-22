<?php
include("funcoes/requisicoes.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifica se 'idProduto' está definido e não está vazio
    if (isset($_POST['idProduto']) && !empty($_POST['idProduto'])) {
        $produtoId = $_POST['idProduto'];
    } else {
        // Define um valor padrão ou lida com a ausência do parâmetro
        $produtoId = null; // Ou qualquer valor padrão que você desejar
    }
    $dataNascimento = DateTime::createFromFormat('d/m/Y', $_POST['dataNascimento']);

    $formData = [
        'codigoindicador' => $_SESSION['codigo_indicador'],
        'tipoPessoa' => $_POST['tipoPessoa'],
        'nomeAfiliado' => $_POST['nomeAfiliado'],
        'razaoSocial' => $_POST['razaoSocial'],
        'dataNascimento' => $dataNascimento,
        'genero' => $_POST['genero'],
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
        // Processa a resposta e redireciona ou exibe mensagem de sucesso        
        $_SESSION['email'] = $_POST['email'];
          if($produtoId){
            $_SESSION['produtoId'] = $produtoId;
            $_SESSION['pessoaId'] = $response['data']['data']['pessoa_id'];
            if($_SESSION['pessoaId']) {
                // Redirecionar para a URL
                header('Location: checkout.php');
            } else {
                var_dump($response);
            }
            exit();
          } else {
            // Redirecionar para a URL
            header('Location: sucesso.php');
            exit;
          }
    } else {
        // Exibe mensagem de erro
        echo "Ocorreu um erro: " . $response['message'];
    }
}