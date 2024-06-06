respostass = '';
var update = {
    "id": null,
    "cnpj" : "",
    "razaoSocial" : "",
    "situacaoReceita" : "",
    "faturamentoAnual" : "",
    "folhaDePagamento":"",
    "quantidadeFuncionarios" : "",
    "regimeTributacao" : "",
    "comercial" : {
        "id": "",
        "nomeComercial": "",
        "email": ""
    }
};

function getBotResponse(input, numPergunta) {
    console.log("entrou aqui");
    if (numPergunta == 0){
        
        update["comercial"]["nomeComercial"] = input;
        document.getElementById("textInput").type = "email";
        document.getElementById("textInput").placeholder = "example@example.com";
        
        return "Digite seu email, por favor:";
    } else if (numPergunta == 1) {
        resposta = validacaoEmail(input);
        if (resposta != 'Email inválido') {
            update["comercial"]["email"] = input;
            document.getElementById("textInput").type = "text";
            formataCnpj(numPergunta);
            document.getElementById("textInput").placeholder = "XX.XXX.XXX/XXXX-XX";
            const params = new URLSearchParams(window.location.search);
            update['cnpj'] = params.get('cnpj');
            document.getElementById('textInput').value = update['cnpj'];
            sendButton();
            return "Realizando busca no servidor... Aguarde";
        } else {
            return "Email inválido, digite um email válido por favor. Ex: email@example.com";
        }
        
    } else if (numPergunta == 2) {

        if (validaCNPJ(input)) {
            var cnpj_tratado = input.replace("/","").replace(".","").replace("-","");
            update["cnpj"] = cnpj_tratado.replace(".","");
            

                fetch('https://api-chat.taxchatbot.click/empresas/cnpj/' + update['cnpj']).then(resp => resp.json())
                .then(r => {

                        if(r['id'] != null){
                            let botHtml = '<p class="botText"><span id="b_requisicao">' + 'Esse CNPJ já existe em nossa base de dados, deseja atualizar as informações financeiras com os dados informados?' + '</span></p>';
                            $("#chatbox").append(botHtml);
                            document.getElementById("chat-bar-bottom").scrollIntoView(true);

                            let btnAtualizar = '<input id="btAtualizar" type="button" class="btnOpcoes ok" value="SIM">';
                            $("#chatbox").append(btnAtualizar);
                            let btnCancela = '<input id="btCancelar" type="button" class="btnOpcoes cancel" value="NÃO">';
                            $("#chatbox").append(btnCancela);
                            document.getElementById("chat-bar-bottom").scrollIntoView(true);
                            
                            document.getElementById('btAtualizar').addEventListener('click', atualizar_financeiro);
                            document.getElementById('btCancelar').addEventListener('click', finalizar_app);
                        }
                }).catch(e => {console.log(e);});
            
            formataCnpj(numPergunta);
            document.getElementById("textInput").type = "button";
            
        } else {
            return "CNPJ inválido";
        }
       
        return "terminou";

        
    } else if (numPergunta == 3) {
        document.getElementById("textInput").placeholder = "";
        
        if (input.toLowerCase() == 'sim' || input.toLowerCase() == 's') {
            return "O CNPJ informado se encontra em qual regime de tributação LUCRO REAL, ou LUCRO PRESUMIDO?";
        } else {
            return 'Verifique se o CNPJ está correto, e o digite novamente.';
        }
    } else if (numPergunta == 4) {
        document.getElementById("textInput").addEventListener("keypress", onlynumber);
        update["regimeTributacao"] = input;
        document.getElementById("textInput").type = "text";

        document.getElementById("textInput").addEventListener('input', moeda);
        
        return "Qual a receita líquida anual aproximada? Caso não souber, basta digitar 0.";
    }   else if (numPergunta == 5) {
        update["faturamentoAnual"] = input;
        document.getElementById("textInput").removeEventListener('input', moeda);
        return "Qual a quantidade de funcionários aproximada? Caso não souber, basta digitar 0.";
    } else if (numPergunta == 6) {
        update["quantidadeFuncionarios"] = input;
        document.getElementById("textInput").addEventListener('input', moeda);
        return "Qual o valor da folha de pagamento anual aproximada? Caso não souber, basta digitar 0.";
    } else if (numPergunta == 7) {
        update["folhaDePagamento"] = input;
        fetch('https://api-chat.taxchatbot.click/comerciais/email/' + update['comercial']['email']).then(resp => resp.json())
                .then(r => {

                    if (r['id'] != null ){
                        update['comercial'] = r

                        update['faturamentoAnual'] = parseFloat(update['faturamentoAnual'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                        update['folhaDePagamento'] = parseFloat(update['folhaDePagamento'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                        var options = {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(update),
                            };
                
                            if (flag_atualizacao == 'nao')
                                fetch('https://api-chat.taxchatbot.click/empresas', options).catch(e => {console.log(e);});
                            else {
                                fetch('https://api-chat.taxchatbot.click/empresas/cnpj/' + update['cnpj']).then(resp => resp.json())
                                .then(r => {

                                    r['faturamentoAnual'] = parseFloat(update['faturamentoAnual'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                                    r['folhaDePagamento'] = parseFloat(update['folhaDePagamento'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                                    r['quantidadeFuncionarios'] = update['quantidadeFuncionarios'];

                                    var options = {
                                        method: 'POST',
                                        headers: {
                                        'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(r),
                                        };

                                    fetch('https://api-chat.taxchatbot.click/empresas/atualiza', options).catch(e => {console.log(e);});
                                }).catch(e => {console.log(e);});
                                
                            }
                    } else {

                        var options = {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(update['comercial']),
                        };
                        
                        fetch('https://api-chat.taxchatbot.click/comerciais', options).then(resp => resp.json())
                        .then(c => {
                            
                            var options = {
                                method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(update),
                            };
                            update['comercial'] = c;
                            if (flag_atualizacao == 'nao'){
                                fetch('https://api-chat.taxchatbot.click/empresas', options).catch(e => {exibeChat('Ocorreu um problema, tente mais tarde');});
                            }
                            else {
                                fetch('https://api-chat.taxchatbot.click/empresas/cnpj/' + update['cnpj']).then(resp => resp.json())
                                .then(r => {

                                    r['faturamentoAnual'] = parseFloat(update['faturamentoAnual'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                                    r['folhaDePagamento'] = parseFloat(update['folhaDePagamento'].toString().replace('.', '').replace('.','').replace('.','').replace(',','.'));
                                    r['quantidadeFuncionarios'] = update['quantidadeFuncionarios'];

                                    var options = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(r),
                                        };
                                        
                                    fetch('https://api-chat.taxchatbot.click/empresas/atualiza', options).catch(e => {console.log(e);});
                                }).catch(e => {exibeChat('Ocorreu um problema, tente mais tarde');});

                            }
                        }).catch(e => {console.log(e);});
                    }
                    
        }).catch(e => {console.log(e);});
        
        return "Aguarde um pouco...";
        
    }

}

var function_cnpj = function fn (event){
    var x = event.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    event.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');    
}


// HABILITA SOMENTE NUMEROS NO INPUT

function onlynumber(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    //var regex = /^[0-9.,]+$/;
    var regex = /^[0-9.]+$/;
    if( !regex.test(key) ) {
       theEvent.returnValue = false;
       if(theEvent.preventDefault) theEvent.preventDefault();
    }
 }


 // ABILITA E DESABILITA MASCARA CNPJ
function formataCnpj(numPergunta) {

    if (numPergunta == 1){
        document.getElementById('textInput').addEventListener('input', function_cnpj);
    } else {
        document.getElementById('textInput').removeEventListener('input', function_cnpj);
    }
}

function validacaoEmail(email) {

    var re = /\S+@\S+\.\S+/;
    if (re.test(email)) {
        return "Email válido";
    } else {
        return "Email inválido";
    }
}

function validaCNPJ (cnpj) {
    var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ]
    var c = String(cnpj).replace(/[^\d]/g, '')
    
    if(c.length !== 14)
        return false

    if(/0{14}/.test(c))
        return false

    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
    if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
    if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    return true
}


String.prototype.reverse = function(){
    return this.split('').reverse().join(''); 
  };
  
var moeda =  function mascaraMoeda(evento){
    campo = document.getElementById('textInput');
    var tecla = (!evento) ? window.event.keyCode : evento.which;
    var valor  =  campo.value.replace(/[^\d]+/gi,'').reverse();
    var resultado  = "";
    var mascara = "###.###.###.###,##".reverse();
    for (var x=0, y=0; x<mascara.length && y<valor.length;) {
      if (mascara.charAt(x) != '#') {
        resultado += mascara.charAt(x);
        x++;
      } else {
        resultado += valor.charAt(y);
        y++;
        x++;
      }
    }
    campo.value = resultado.reverse();
  }