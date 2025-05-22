<?php
session_start();

// Verificar se o usuário tem acesso a esta página
if (!isset($_SESSION['email'])) {
    header("Location: index.php");
    exit();
}

$email = $_SESSION['email'];
$nome_indicador = isset($_SESSION['nomeindicador']) ? $_SESSION['nomeindicador'] : 'VitaTop';

// Limpar sessão após mostrar sucesso
unset($_SESSION['email']);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro Realizado - VitaTop</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Success Animation -->
        <div class="success-animation">
            <div class="success-circle">
                <i class="fas fa-check success-icon"></i>
            </div>
        </div>
        
        <!-- Logo -->
        <div class="logo-container">
            <div class="logo">
                <img src="img/logo.png" alt="VitaTop" width="180px">
            </div>
        </div>
        
        <div class="success-content">
            <h2>Bem-vindo à <?php echo htmlspecialchars($nome_indicador); ?>!</h2>
            <p>Seu cadastro foi realizado com sucesso</p>
            
            <div class="success-details">
                <div class="success-item">
                    <i class="fas fa-envelope"></i>
                    <span>Confirmação enviada para: <strong><?php echo htmlspecialchars($email); ?></strong></span>
                </div>
                <div class="success-item">
                    <i class="fas fa-rocket"></i>
                    <span>Sua jornada como distribuidor independente começa agora!</span>
                </div>
                <div class="success-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Em breve você receberá as instruções de acesso por e-mail</span>
                </div>
            </div>
            
            <div class="success-actions">
                <a href="https://vitatop.tecskill.com.br/" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i>
                    Visitar site oficial
                </a>
                <a href="<?php echo isset($_GET['codigoindicador']) ? 'index.php?codigoindicador=' . urlencode($_GET['codigoindicador']) : 'index.php'; ?>" class="btn-secondary">
                    <i class="fas fa-redo"></i>
                    Novo cadastro
                </a>
            </div>
        </div>
    </div>

    <style>
        .container {
            text-align: center;
        }
        
        .success-animation {
            margin-bottom: 32px;
        }
        
        .success-circle {
            width: 80px;
            height: 80px;
            background: var(--accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: successPulse 1s ease-out;
        }
        
        .success-icon {
            color: white;
            font-size: 32px;
        }
        
        .success-content h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--text-primary);
        }
        
        .success-content p {
            color: var(--text-secondary);
            font-size: 16px;
            margin-bottom: 24px;
        }
        
        .success-details {
            background: var(--secondary);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 24px;
            text-align: left;
        }
        
        .success-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin: 12px 0;
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .success-item i {
            color: var(--accent);
            font-size: 16px;
            margin-top: 2px;
        }
        
        .success-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
    </style>
    
    <script>
        // Add confetti effect on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Simple confetti effect
            const colors = ['#7cbe42', '#00591f', '#10b981', '#f59e0b'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.borderRadius = '50%';
                
                document.body.appendChild(confetti);
                
                // Animate confetti
                confetti.animate([
                    { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
                ], {
                    duration: 3000 + Math.random() * 2000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => {
                    confetti.remove();
                };
            }
        });
    </script>
</body>
</html>