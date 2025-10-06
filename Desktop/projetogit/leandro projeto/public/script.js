// Formatação de CPF
function formatarCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return valor;
}

// Formatação de telefone
function formatarTelefone(valor) {
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return valor;
}

// Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de e-mail
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Event listeners para formatação em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const emailInput = document.getElementById('email');
    const form = document.getElementById('cadastroForm');
    
    // Formatação de CPF
    cpfInput.addEventListener('input', function(e) {
        e.target.value = formatarCPF(e.target.value);
    });
    
    // Formatação de telefone
    telefoneInput.addEventListener('input', function(e) {
        e.target.value = formatarTelefone(e.target.value);
    });
    
    // Validação de CPF ao sair do campo
    cpfInput.addEventListener('blur', function(e) {
        if (e.target.value && !validarCPF(e.target.value)) {
            mostrarMensagem('CPF inválido! Por favor, verifique o número digitado.', 'erro');
            e.target.focus();
        }
    });
    
    // Validação de e-mail ao sair do campo
    emailInput.addEventListener('blur', function(e) {
        if (e.target.value && !validarEmail(e.target.value)) {
            mostrarMensagem('E-mail inválido! Por favor, verifique o endereço digitado.', 'erro');
            e.target.focus();
        }
    });
    
    // Submissão do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validações finais
        if (!validarCPF(cpfInput.value)) {
            mostrarMensagem('CPF inválido! Por favor, corrija antes de continuar.', 'erro');
            cpfInput.focus();
            return;
        }
        
        if (!validarEmail(emailInput.value)) {
            mostrarMensagem('E-mail inválido! Por favor, corrija antes de continuar.', 'erro');
            emailInput.focus();
            return;
        }
        
        // Coletar dados do formulário
        const formData = {
            dono: {
                nome_completo: document.getElementById('nome_completo').value.trim(),
                cpf: cpfInput.value.replace(/\D/g, ''),
                email: emailInput.value.trim(),
                telefone: telefoneInput.value,
                endereco: document.getElementById('endereco').value.trim()
            },
            pet: {
                nome_pet: document.getElementById('nome_pet').value.trim(),
                especie: document.getElementById('especie').value,
                raca: document.getElementById('raca').value.trim(),
                data_nascimento: document.getElementById('data_nascimento').value,
                observacoes: document.getElementById('observacoes').value.trim()
            }
        };
        
        // Desabilitar botão de submit
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cadastrando...';
        
        try {
            // Enviar dados para o backend
            const response = await fetch('http://localhost:3000/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarMensagem('Cliente e pet cadastrados com sucesso!', 'sucesso');
                form.reset();
                
                // Scroll para o topo
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                mostrarMensagem(result.message || 'Erro ao cadastrar. Tente novamente.', 'erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro de conexão com o servidor. Verifique se o servidor está rodando.', 'erro');
        } finally {
            // Reabilitar botão de submit
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Cadastrar Cliente e Pet
            `;
        }
    });
});

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.style.display = 'flex';
    
    // Adicionar ícone
    const icone = document.createElement('span');
    icone.innerHTML = tipo === 'sucesso' 
        ? '✓' 
        : '⚠';
    icone.style.fontSize = '1.2rem';
    icone.style.fontWeight = 'bold';
    mensagemDiv.insertBefore(icone, mensagemDiv.firstChild);
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 5000);
}
