var Botkit = require('botkit');
var request = require("request");
var accessToken = process.env.ACCESS_TOKEN;
var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var data = new Date();
var botOuviu;
var globalID;
var localPedido;
var tipoPessoaPedido;
var qtdCafePedido = 0;
var qtdAguaPedido = 0;
var auxPedido = 0
var frasePedido;
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
    auxPedido = 0;
    globalID = 0;
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
    auxPedido = 0;
    globalID = 0;
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
                    criaGuest(verificaUser, emailGuest, senhaCriada, function (code) {

                        console.log('########## Code ' + code);
                        if (code == 201) {
                            bot.reply(message, "Prontinho...\n\nAgora é só acessar o SSID 2S_Guest e colocar os seguintes dados:\n\nUsuário: " + emailGuest + "\n\nSenha: " + senhaCriada + "\n\nBoa navegação!!\n\n*-- O acesso dura 2 dias a partir do primeiro login --*");
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
        if (verificaUser.match(/@webex.bot/)) {
            //faz nada
        } else {
            bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
        }
    }
});

//pega o local da reunião e guarda na variável localPedido 
controller.hears(['sala', 'lounge', 'JP', 'Carneiro', 'Reuniões', 'Monaco', 'Pedro'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (globalID == 2) {
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //não faz nada
            } else {
                auxPedido = 11;
                localPedido = message.text;
                bot.reply(message, "É uma reunião interna ou com cliente? *Responda apenas 'interna' ou 'cliente' por favor*");
            }
        } else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    } else {
        if (verificaUser.match(/@webex.bot/)) {
            //faz nada
        } else {
            bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
        }
    }
});

//pega o tipo de convidado da reunião e guarda na variável tipoPessoaPedido
controller.hears(['interna', 'interno', 'cliente'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (globalID == 2 && auxPedido == 11) {
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //não faz nada
            } else {
                auxPedido = 12;
                tipoPessoaPedido = message.text;
                bot.reply(message, "Quantos cafés deseja? *Responda apenas o número por favor, caso não precise, digite 0*");
            }
        } else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    } else {
        if (verificaUser.match(/@webex.bot/)) {
            //faz nada
        } else {
            bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
        }
    }
});

// recebe não como resposta e informa que não pode ajudar
controller.hears(['Não', 'Agora não', 'Nao'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (globalID == 1) {
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //bot não faz nada mas reconhece que o não veio dele mesmo
            } else {
                bot.reply(message, "Poxa :(\n\nEntão a hora que quiser pode me chamar!");
            }
        } else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    } if (globalID == 2) {
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //faz nada
            } else {
                bot.reply(message, "Então vamos voltar e começar de novo, digite 'menu'");
            }
        } else {
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    }
    
    else {
        if (verificaUser.match(/@webex.bot/)) {
            // faz nada
        } else {
            bot.reply(message, "Parece que você não selecionou o que deseja no menu, por favor informe o número");
        }
    }
});

// recebe sim como resposta 
controller.hears(['Sim', 'Confirmo'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (globalID == 2) {
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //faz nada
            } else {

                var options = {
                    method: 'POST',
                    url: 'https://api.ciscospark.com/v1/messages',
                    headers:
                    {
                        Authorization: 'Bearer ZGY2ZjVlMGQtZmJiZi00MzliLWFhMjEtYjEwYzgzOTlkYzIwZGQ3NDQzODEtNWUz',
                        'Content-Type': 'application/json'
                    },
                    body:
                    {
                        "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vZTBlODk2ZTAtYTYxYS0xMWU4LTllOGEtYzdiZjgxNGU5MGUx",
                        "text": "Chegou um pedido de café/água!\nSolicitante: " + verificaUser + "\nPedido:\n" + frasePedido

                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) {
                        console.log('### Error API Dólar -> ' + error);
                    } else {
                        console.log('############ response -> ' + response.statusCode);
                    }
                });

                bot.reply(message, "Prontinho, seu pedido foi enviado para o espaço Cafezinho 2S");
                auxPedido = 0;
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
function criaGuest(pessoaVisitada, userEmail, userSenha, callback) {
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
                personBeingVisited: pessoaVisitada,
                portalId: 'bcd76bc2-8a3e-11e8-84e7-005056a65ea2',
                customFields: {},
            }
        },
        json: true
    };

    request(options, function (error, response, body) {

        if (response.statusCode >= 400) {
            console.log('### Error Create -> ' + error);
        }
        callback(response.statusCode);
    }
    );
}

//faz o GET na API da moeda
function pegarDolar(callback) {
    if (globalID == 3) {

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

    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        if (verificaUser.match(/@webex.bot/)) {
            //faz nada
        } else {
            if (auxPedido > 0) {
                switch (auxPedido) {

                    //cases do questionário do café/água
                    case auxPedido = 12:
                        qtdCafePedido = message.text;
                        auxPedido = 13;
                        bot.reply(message, "Quantas águas deseja? *Responda apenas o número por favor, caso não precise, digite 0*");
                        break;

                    case auxPedido = 13:
                        qtdAguaPedido = message.text;
                        frasePedido = "      - Local: " + localPedido + "\n      - Tipo de reunião: " + tipoPessoaPedido + "\n      - Cafés: " + qtdCafePedido + "\n      - Águas: " + qtdAguaPedido
                        bot.reply(message, "Revise seu pedido:\n\n- Local: " + localPedido + "\n- Tipo de reunião: " + tipoPessoaPedido + "\n- Cafés: " + qtdCafePedido + "\n- Águas: " + qtdAguaPedido + "\n\nVocê confirma o pedido? *[Sim/Não]*");
                        break;
                }
            } else {
                switch (botOuviu) {

                    //cases do menu principal
                    case '1':
                        console.log('########## ouvi 1 -> Criar Guest');
                        globalID = 1;
                        bot.reply(message, "Por favor digite apenas o e-mail do convidado.");
                        break;

                    case '2':
                        console.log('########## ouvi 2 -> Pedir Café');
                        globalID = 2;
                        bot.reply(message, "Entendido, por favor responda o questionário a seguir: \n\n1) Onde você está? *Exemplo: sala do Carneiro, sala de reuniões, lounge...*");
                        break;

                    case '3':
                        console.log('########## ouvi 3 -> Cotação Dólar');
                        globalID = 3;
                        pegarDolar(function (valorDolar) {
                            bot.reply(message, "O valor do dólar comercial nesse momento é de R$ " + Math.round(valorDolar * 100) / 100);
                            bot.reply(message, "*Essa cotação é informativa. Para uso em propostas comerciais e assuntos oficiais da 2S entre em contato com nosso time financeiro*");
                        });
                        break;
                }
            }
        }
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//ACCESS_TOKEN=ZGY2ZjVlMGQtZmJiZi00MzliLWFhMjEtYjEwYzgzOTlkYzIwZGQ3NDQzODEtNWUz PUBLIC_URL=http://8f42bb72.ngrok.io node main.js