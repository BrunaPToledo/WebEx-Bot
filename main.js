var Botkit = require('botkit');
var request = require("request");
var accessToken = process.env.ACCESS_TOKEN;
var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var data = new Date();
var botOuviu;
var globalID;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


if (!accessToken) {
    console.log("Deu ruim na chave de acesso");
    process.exit(1);
}

if (!process.env.PUBLIC_URL) {
    console.log("Deu ruim na URL Publica");
    process.exit(1);
}

var controller = Botkit.sparkbot({
    log: true,
    debug: true,
    public_address: process.env.PUBLIC_URL,
    ciscospark_access_token: accessToken,
    webhook_name: process.env.WEBHOOK_NAME
});

var bot = controller.spawn({});

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("Webhook set up!");
    });
});



//comando para dar olá e mostrar o menu
controller.hears(['Olá', 'Opa', 'Ola', 'Oi', 'Salve'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        if (verificaUser.match(/@webex.bot/)) {
            //não faz nada
        } else {
            bot.reply(message, "Oi humano!\n\nPor favor digite o número correspondente ao que deseja :)\n\n1 - Criar acesso Guest Wi-Fi\n\n2 - Pedir um café para seus convidados\n\n3 - Consultar a cotação do dólar\n\n\n*-- Para ver o menu novamente, basta digitar 'menu' --*");
        }
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

controller.hears(['Menu'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        if (verificaUser.match(/@webex.bot/)) {
            //não faz nada
        } else {
            bot.reply(message, "Por favor digite o número correspondente ao que deseja :)\n\n1 - Criar acesso Guest Wi-Fi\n\n2 - Pedir um café para seus convidados\n\n3 - Consultar a cotação do dólar");
        }
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});


//verifica se o email é valido e confirma que recebeu com sucesso 
controller.hears(['@'], 'direct_message,direct_mention', function (bot, message) {
    if (globalID == 1) {
        //email de quem digita
        var verificaUser = message.user;
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //não faz nada
            } else {
                //email digitado 
                var emailGuest = message.text;
                //senha a ser criada
                var senhaCriada;
                if (regexEmail.test(emailGuest)) {
                    console.log('### Chamando criaGuest com o parametro -> ' + emailGuest);

                    function gerarSenha() {
                        return Math.random().toString(36).slice(-8);
                    }
                    senhaCriada = gerarSenha();

                    //chama a função para criar o guest
                    criaGuest(emailGuest, senhaCriada, function (code) {

                        console.log('########## Code ' + code);
                        if (code == 201) {
                            bot.reply(message, "Prontinho...\n\nAgora é só acessar o SSID 2S_Guest e colocar os seguintes dados:\n\nUsuário: " + emailGuest + "\n\nSenha: " + senhaCriada + "\n\nBoa navegação!!");
                        } else {
                            bot.reply(message, "Xí, parece que alguma coisa deu errado.\n\nPor favor avise a Bruna.");
                        }
                    });

                } else {
                    if (verificaUser.match(/@webex.bot/)) {
                        //faz nada
                    } else {
                        bot.reply(message, "E-mail inválido");
                    }
                }
            }
        }
        else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    } else {
        bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
    }
});


// recebe não como resposta e informa que não pode ajudar
controller.hears(['Não', 'Agora não', 'Nao'], 'direct_message,direct_mention', function (bot, message) {
    if (globalID == 1) {
        var verificaUser = message.user;
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //bot não faz nada mas reconhece que o não veio dele mesmo
            } else {
                bot.reply(message, "Poxa :(\n\nEntão a hora que quiser pode me chamar!");
            }
        } else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    } else {
        if (verificaUser.match(/@webex.bot/)) {
            // faz nada
        } else {
            bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
        }
    }
});

/*
// pergunta o email
controller.hears(['Sim', 'Eu quero', 'Quero', 'Desejo'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Entendido!\n\nPor favor digite apenas o e-mail do convidado.");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});
*/

// Responde a agradecimentos 
controller.hears(['Obrigada', 'Obrigado', 'Valeu', 'Vlw', 'Thanks', 'Grato'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Estou aqui para ajudar :)");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//Cria o guest com o e-mail que recebeu no teams
function criaGuest(userEmail, userSenha, callback) {
    var diaAMais = new Date();
    diaAMais.setDate(diaAMais.getDate() + 1);

    var strfromDate = (data.getMonth() + 1) + '/' + data.getDate() + '/' + data.getFullYear() + ' ' + data.getHours() + ':' + data.getMinutes();
    var strtoDate = (diaAMais.getMonth() + 1) + '/' + (diaAMais.getDate()) + '/' + diaAMais.getFullYear() + ' ' + '23' + ':' + '00';

    var options = {
        method: 'POST',
        url: 'https://10.3.161.171:9060/ers/config/guestuser',
        headers:
        {
            Authorization: 'Basic c3BvbnNvci11c2VyOlBAc3N3MHJk',
            'ERS-Media-Type': 'identity.guestuser.2.0',
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body:
        {
            GuestUser: {
                name: 'guest',
                guestType: 'Guest Type (Wireless Setup - Beta)',
                status: 'ACTIVE',
                sponsorUserName: 'sponsor-api',
                guestInfo: {
                    userName: userEmail,
                    firstName: '',
                    lastName: '',
                    emailAddress: userEmail,
                    password: userSenha,
                    creationTime: '',
                    enabled: true,
                    notificationLanguage: 'English',
                    smsServiceProvider: 'Global Default'
                },
                guestAccessInfo: {
                    validDays: 2,
                    fromDate: strfromDate,
                    toDate: strtoDate,
                    location: 'San Jose'
                },
                portalId: 'bcd76bc2-8a3e-11e8-84e7-005056a65ea2',
                customFields: {},
            }
        },
        json: true
    };

    request(options, function (error, response, body) {

        if (error) {
            console.log('### Error Create -> ' + error);
        }
        callback(response.statusCode);
    }
    );
}

//faz o GET na API da moeda
function pegarDolar(callback) {
    var dolar;
    var options = {
        method: 'GET',
        url: 'http://economia.awesomeapi.com.br/json/USD-BRL/1/1', 
    };

    request(options, function (error, response, body) {
        body = JSON.parse(body);
        console.log('###### Body Moeda -> ' + JSON.stringify(body));

        if (error) {
            console.log('### Error API Dólar -> ' + error);
        } else {
            dolar = body[0].ask;
            callback(dolar);
        }
    });
}

function retornaId(userEmail) {
    var idFinal;
    var idRetornado;
    var options = {
        method: 'GET',
        url: 'https://10.3.161.171:9060/ers/config/guestuser?filter=name.CONTAINS.' + userEmail,
        headers:
        {
            Authorization: 'Basic c3BvbnNvci11c2VyOlBAc3N3MHJk',
            'ERS-Media-Type': 'identity.guestuser.2.0',
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    };

    idFinal = request(options, function (error, response, body) {
        body = JSON.parse(body);
        console.log('###### Body ID ' + JSON.stringify(body));

        if (error) {
            console.log('### Error ID -> ' + error);
        } else {
            if (body.SearchResult.resources.length > 0) {
                idRetornado = body.SearchResult.resources[0].id;
            }

            console.log('####### dentro do request -> ' + idRetornado);
            return idRetornado;

        }
    }
    );
    console.log('####### método retornaID -> ' + idFinal);
}

//easter egg 1
controller.hears(['Trouxa'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/)) {
        bot.reply(message, "Você que é");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//easter egg 2
controller.hears(['Inovações'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/)) {
        bot.reply(message, "É a empresa onde eu trabalho :D\n\nFocada em tecnologia Cisco, fundada em 1992 e ano passado comemorou 25 anos!!\n\nPedrão, não esquece meu salário!\n\nVoto Carneiro para presidente o/");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//easter egg 3
controller.hears(['Quem é sua mãe?'], 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, "Minha criadora se chama Bruna Toledo ;)");
});

//easter egg 4
controller.hears(['Severino'], 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, "Tò aquiiiii");
});

//easter egg 5
controller.hears(['Marcelão'], 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, "Isso é uma bichoooooooooona");
});

//cases do menu
controller.hears(['.*'], 'direct_message,direct_mention', function (bot, message) {
    botOuviu = message.text;

    switch (botOuviu) {

        //para criar o guest opção 1 do menu
        case '1':
            console.log('########## ouvi 1 -> Criar Guest');
            globalID = 1;
            bot.reply(message, "Por favor digite apenas o e-mail do convidado.");
            break;

        case '2':
            console.log('########## ouvi 2 -> Pedir Café');
            globalID = 2;
            bot.reply(message, "Por favor informe a sala onde você está e quantos cafés/águas deseja.");
            break;

        case '3':
            console.log('########## ouvi 3 -> Cotação Dóloar');
            globalID = 3;
            pegarDolar(function (valorDolar) {
                bot.reply(message, "O valor do dólar comercial nesse momento é de R$ " + Math.round(valorDolar * 100) / 100);
            });
            break;
    }
});


//ACCESS_TOKEN=ZGY2ZjVlMGQtZmJiZi00MzliLWFhMjEtYjEwYzgzOTlkYzIwZGQ3NDQzODEtNWUz PUBLIC_URL=http://e3022f27.ngrok.io node main.js

// id meu NGI4YzllYmQtYWJmNS00MjEyLWFiYWMtODU5YmJjMGNhZGI0ZTI2Y2JmNDctZGUw