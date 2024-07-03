// Collapsible
var coll = document.getElementsByClassName("collapsible");
var cont = 0;
var flag_atualizacao = "nao";
var textoButton = "";

var atualizar_financeiro = function fin (event){
    cont = 3;
    textoButton = "sim";
    getResponse("button");
    flag_atualizacao = "sim";
    document.getElementById('btAtualizar').removeEventListener('click', atualizar_financeiro);
}

var finalizar_app = function fin (event){
    let botHtml = '<p class="botText"><span>' + 'Aguarde a análise do CNPJ informado ficar pronta, ou atualize a página e tente cadastrar um novo. A TAXINNOVATION IA agradece.' + '</span></p>';
    $("#chatbox").append(botHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);
    document.getElementById('btAtualizar').removeEventListener('click', finalizar_app);
}

var listener_ok = function fn () {
    textoButton = "sim";
    getResponse("button");
    
}

var listener_cancel = function fn () {
    textoButton = "nao";
    getResponse("button");
}

var listener_real = function fn () {
    textoButton = "LUCRO REAL";
    getResponse("button");
    document.getElementById("btnReal").removeEventListener("click", listener_real);
}

var listener_presumido = function fn () {
    textoButton = "LUCRO PRESUMIDO";
    getResponse("button");
    document.getElementById("btnPresumido").removeEventListener("click", listener_presumido);
}

var listener_naoSabe = function fn () {
    textoButton = "NÃO SEI";
    getResponse("button");
    document.getElementById("btnNaoSabe").removeEventListener("click", listener_naoSabe);
}

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }

    });
}

function getTime() {
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let time = hours + ":" + minutes;
    return time;
}

// Gets the first message
function firstBotMessage() {
    let firstMessage = "Bem vindo a TAXINNOVATION IA. Por favor, nos informe seu nome completo para melhor atende-lo!"
    document.getElementById("botStarterMessage").innerHTML = '<p class="botText"><span>' + firstMessage + '</span></p>';

    let time = getTime();

    $("#chat-timestamp").append(time);
    document.getElementById("userInput").scrollIntoView(false);
}

firstBotMessage();

setTimeout(() => {
    document.getElementById("chat-button").click();
}, 500);
// 60765823000130
// Retrieves the response
function getHardResponse(userText) {
    let botResponse;
    if (cont == 2) {
        
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '3f83a43f58msh17ab7270b8117dap16c090jsnc35f465d7b29',
                'X-RapidAPI-Host': 'consulta-cnpj-gratis.p.rapidapi.com'
            }
        };
        
        botResponse = getBotResponse(userText, 2);
        setTimeout(() => {

            try{
                var texto = document.getElementById('b_requisicao').textContent; 
            } catch {
                var texto = 'cnpj novo';
            }

            if (texto != 'Esse CNPJ já existe em nossa base de dados, deseja atualizar as informações financeiras com os dados informados?') {
                userText = userText.replace("/","").replace(".","").replace("-","").replace(".","");
                fetch('https://consulta-cnpj-gratis.p.rapidapi.com/office/' + userText + '?simples=false', options)
                    .then((response) => response.json())
                    .then((response) => {
    
                        botResponse = 'CNPJ: ' + response['taxId'].replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    
                        exibeChat(botResponse);
                        
                        if (response['alias'] != null){
                            botResponse = 'NOME: ' + response['alias'];
                        } else {
                            botResponse = 'NOME: ' + response['company']['name'];
                        }
                        exibeChat(botResponse);
                        
                        botResponse = 'SITUAÇÃO CADASTRAL: ' + response['status']['text'];
                        exibeChat(botResponse);
                        
                        botResponse = 'CNAE: ' + response['mainActivity']['id'] + ' - ' + response['mainActivity']['text'];
                        exibeChat(botResponse);
    
                        let btnconfirma = '<input type="button" class="btnOpcoes ok" value="SIM">';
                        $("#chatbox").append(btnconfirma);
                        let btnCancela = '<input type="button" class="btnOpcoes cancel" value="NÃO">';
                        $("#chatbox").append(btnCancela);
                        document.getElementById("chat-bar-bottom").scrollIntoView(true);
    
                        var buttons_ok = document.getElementsByClassName("btnOpcoes ok");
                        var buttons_cancel = document.getElementsByClassName("btnOpcoes cancel");
    
                        for (let i = 0; i < buttons_ok.length; i++) {
                            buttons_ok[i].addEventListener("click", listener_ok);
                        }
    
                        for (let i = 0; i < buttons_cancel.length; i++) {
                            buttons_cancel[i].addEventListener("click", listener_cancel);
                        }
            
                }).catch(
                    console.log("Aguardando servidor...")
                );
            } else if (botResponse == "CNPJ inválido"){
                exibeChat("Por favor, nos informe um CNPJ válido");
                cont -= 1; 
            }
        }, 15000);
        
    } else {
        botResponse = getBotResponse(userText, cont);

        if (botResponse == 'Email inválido, digite um email válido por favor. Ex: email@example.com') {
            cont = 0;
        }
        
        if ( botResponse == 'Verifique se o CNPJ está correto, e o digite novamente.'){
            cont = 1;
            exibeChat(botResponse);
            formataCnpj(cont);
            document.getElementById("textInput").type = "text";
            document.getElementById("textInput").placeholder = "XX.XXX.XXX/XXXX-XX";
        } else {
            if (cont == 3){
                exibeChat('Para realizar uma análise mais detalhada, por favor nos informe alguns dados...')
                exibeChat(botResponse);
                let btnReal = '<input id="btnReal" type="button" class="btnTributacao" value="LUCRO REAL">';
                $("#chatbox").append(btnReal);
                let btnPresumido = '<input id="btnPresumido" type="button" class="btnTributacao" value="LUCRO PRESUMIDO">';
                $("#chatbox").append(btnPresumido);
                let btnNaoSabe = '<input id="btnNaoSabe" type="button" class="btnTributacao" value="NÃO SEI">';
                $("#chatbox").append(btnNaoSabe);
                document.getElementById("chat-bar-bottom").scrollIntoView(true);
                document.getElementById("btnReal").addEventListener("click", listener_real);
                document.getElementById("btnPresumido").addEventListener("click", listener_presumido);
                document.getElementById("btnNaoSabe").addEventListener("click", listener_naoSabe);
            } else {
                if (botResponse != "terminou"){
                    exibeChat(botResponse);
                }
            }
        }

        if (botResponse == 'Aguarde um pouco...') {
            setTimeout(() => {
                exibeChat('Obrigado pelas informações. A TAXINNOVATION IA irá analisar e assim que o processo terminar vamos retorna a você. Obrigado pela preferência.');
             }, 5000);
            
        }
        
    }
    
    cont += 1;
}

function exibeChat(botResponse) {
    let botHtml = '<p id="b_' + cont + '" class="botText"><span>' + botResponse + '</span></p>';
    $("#chatbox").append(botHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);
}

//Gets the text text from the input box and processes it
function getResponse(tipoEntrada) {
    
    if (tipoEntrada == "chat") {
        let userText = $("#textInput").val();
        
         if (userText == "") {
             exibeChat("Por favor, o campo não pode ser vazio!!!");
        } else {
            let userHtml = '<p id="' + cont + '" class="userText"><span>' + userText + '</span></p>';

            $("#textInput").val("");
            $("#chatbox").append(userHtml);
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
        
            setTimeout(() => {
                getHardResponse(userText);
             }, 1000)
        } 
    } else {
        setTimeout(() => {
            getHardResponse(textoButton);
        }, 1000)
    }
}

// Handles sending text via button clicks
function buttonSendText(sampleText) {
    let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    //Uncomment this if you want the bot to respond to this buttonSendText event
    // setTimeout(() => {
    //     getHardResponse(sampleText);
    // }, 1000)
}

function sendButton() {
   getResponse("chat");
}

function refresh() {
    document.location.reload(true);
}

// Press enter to send a message
$("#textInput").keypress(function (e) {
    if (e.which == 13) {
        getResponse("chat");
    }
});
