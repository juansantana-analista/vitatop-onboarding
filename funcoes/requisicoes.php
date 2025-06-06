<?php

session_start();

// URL do serviço REST
$location = 'https://vitatop.tecskill.com.br/rest.php';
// Chave de autenticação REST
$rest_key = '50119e057567b086d83fe5dd18336042ff2cf7bef3c24807bc55e34dbe5a';

//Inicio da Função que valida o Indicador
function validaIndicador($location, $rest_key, $codigo_indicador)
{

    // Dados a serem enviados no corpo da requisição
    $postData = [
        'class' => 'PessoaRestService',
        'method' => 'ValidaIndicador',
        'codigoindicador' => $codigo_indicador,
    ];


    // Inicializa o cURL para validação do indicador
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        header("HTTP/1.1 403 Forbidden");
        exit();
    } else {
        // Decodifica a resposta JSON
        $data = json_decode($response, true);

        // Verifica o status da resposta
        if (isset($data['status']) && $data['data']["status"] === 'success') {
            // Pegar os dados do indicador retornados
            $indicador = $data["data"];
            $nome_indicador = $indicador["data"]["nomeindicador"];

            // Define uma variável de sessão
            $_SESSION['codigo_indicador'] = $codigo_indicador;
            $_SESSION['nomeindicador'] = $nome_indicador;
        } else {
            header("location: indisponivel.php");
            exit();
        }
    }

    // Fecha a sessão cURL para validação do indicador
    curl_close($ch);
}
//Fim da Função que valida o Indicador

//Inicio da Função que busca o Pré Cadastro
function buscarPreCadastro($location, $rest_key, $preCadastroId)
{

    // Dados a serem enviados no corpo da requisição
    $postData = [
        'class' => 'PessoaRestService',
        'method' => 'BuscarPreCadastro',
        'preCadastroId' => $preCadastroId,
    ];


    // Inicializa o cURL para validação do indicador
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        header("HTTP/1.1 403 Forbidden");
        exit();
    } else {
        // Decodifica a resposta JSON
        $data = json_decode($response, true);

        // Verifica o status da resposta
        if (isset($data['status']) && $data['data']["status"] === 'success') {
            // Pegar os dados do indicador retornados
            $resultado = $data["data"]["data"];
            $idPreCadastro = $resultado["id_pre_cadastro"];
            $nomePreCadastro = $resultado["nome"];
            $emailPreCadastro = $resultado["email"];
            $celularPreCadastro = $resultado["celular"];
            $codigoIndicador = $resultado["codigo_indicador"];

            // Define uma variável de sessão
            $_SESSION['idPreCadastro'] = $idPreCadastro;
            $_SESSION['nomePreCadastro'] = $nomePreCadastro;
            $_SESSION['emailPreCadastro'] = $emailPreCadastro;
            $_SESSION['celularPreCadastro'] = $celularPreCadastro;
            $_SESSION['codigo_indicador'] = $codigoIndicador;
        } else {
            header("location: indisponivel.php");
            exit();
        }
    }

    // Fecha a sessão cURL para validação do indicador
    curl_close($ch);
}
//Fim da Função que busca o Pré Cadastro

//Inicio da Função que busca Pessoa
function buscarPessoa($location, $rest_key, $idPessoa)
{
    // Buscar Dados Pessoa
    // Dados a serem enviados no corpo da requisição
    $pessoaData = [
        'class' => 'PessoaRestService',
        'method' => 'listarPessoa',
        'pessoa_id' => $idPessoa
    ];

    // Inicializa o cURL para validação do indicador
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($pessoaData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);
    // Executa a requisição
    $response = curl_exec($ch);

    //Retorna os produtos
    return $response;
}
//Fim da Função que busca Pessoa

//Inicio da Função que busca Combos Disponíveis
function buscarCombos($location, $rest_key)
{
    // Dados a serem enviados no corpo da requisição
    $postData = [
        'class' => 'ProdutoVariacaoRest',
        'method' => 'loadAll',
            'filters' => [
                ['produto_kit', '=', 1]
            ]
    ];

    // Inicializa o cURL
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => $error];
    }

    // Decodifica a resposta JSON
    $result = json_decode($response, true);
    curl_close($ch);

    // Retorna o resultado
    return $result;
}
//Fim da Função que busca Combos Disponíveis

//Inicio da Função que valida o formulario e cadastra o usuario
function processarFormulario($location, $rest_key, $formData)
{
    // Dados a serem enviados no corpo da requisição
    $requestData = [
        'class' => 'PessoaRestService',
        'method' => 'salvarNovoUsuario',
        'dados' => $formData
    ];

    // Inicializa o cURL
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => $error];
    }

    // Decodifica a resposta JSON
    $result = json_decode($response, true);
    curl_close($ch);

    // Retorna o resultado
    return $result;
}
//Fim da Função que valida o formulario e cadastra o usuario

//Inicio da Função que verifica CPF cadastrado
function verificarCpf($location, $rest_key, $formData)
{
    // Dados a serem enviados no corpo da requisição
    $requestData = [
        'class' => 'PessoaRestService',
        'method' => 'ValidaCPFCNPJ',
        'dados' => $formData
    ];

    // Inicializa o cURL
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => $error];
    }

    // Decodifica a resposta JSON
    $result = json_decode($response, true);
    curl_close($ch);

    // Retorna o resultado
    return $result;
}
//Fim da Função que verifica CPF cadastrado


//Inicio da Função que verifica Email cadastrado
function verificarEmail($location, $rest_key, $formData)
{
    // Dados a serem enviados no corpo da requisição
    $requestData = [
        'class' => 'PessoaRestService',
        'method' => 'ValidaEmail',
        'dados' => $formData
    ];

    // Inicializa o cURL
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => $error];
    }

    // Decodifica a resposta JSON
    $result = json_decode($response, true);
    curl_close($ch);

    // Retorna o resultado
    return $result;
}
//Fim da Função que verifica Email cadastrado

//Inicio da Função que processa pagamento
function processarPagamento($location, $rest_key, $paymentData)
{
    // Dados a serem enviados no corpo da requisição
    $requestData = [
        'class' => 'PagamentoRestService',
        'method' => 'processarPagamento',
        'dados' => $paymentData
    ];

    // Inicializa o cURL
    $ch = curl_init($location);

    // Define as opções do cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $rest_key
    ]);

    // Executa a requisição
    $response = curl_exec($ch);

    // Verifica se houve erros
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => $error];
    }

    // Decodifica a resposta JSON
    $result = json_decode($response, true);
    curl_close($ch);

    // Retorna o resultado
    return $result;
}
//Fim da Função que processa pagamento