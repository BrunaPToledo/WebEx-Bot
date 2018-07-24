var Botkit = require('botkit');
var request = require("request");
var accessToken = process.env.ACCESS_TOKEN;
var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var data = new Date();
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

controller.setupWebserver(process.env.PORT || 3000, function(err, webserver){
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log("Webhook set up!");
    });
});

//verifica se o email é valido e confirma que recebeu com sucesso
controller.hears(['@'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        var emailGuest = message.text;
        //var data = new Date();

        if(regexEmail.test(emailGuest)) {
            console.log('### Chamando doRequest com o parametro -> ' + emailGuest);
            doRequest(emailGuest);
            bot.reply(message, "Prontinho...\n\nAgora é só acessar o SSID 2S_Guest e colocar os seguintes dados:\n\nUsuário: " + emailGuest + "\n\nSenha: 2S@Guest195\n\nBoa navegação!!");

        } else {
            if(verificaUser.match(/@webex.bot/)){

            } else {
                bot.reply(message, "E-mail inválido");
            }
        } 
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

// comando para dar olá e mostrar a função
controller.hears(['Olá', 'Opa', 'Ola', 'Oi'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Hey humano!\n\nVocê deseja criar um usuário guest para nosso wi-fi?");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

// pergunta o email
controller.hears(['Sim', 'Eu quero', 'Quero', 'Desejo'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Entendido!\n\nPor favor digite apenas o e-mail do convidado.");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

// recebe não como resposta e informa que não pode ajudar
controller.hears(['Não', 'Agora não', 'Nao'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Poxa :(\n\nEntão a hora que quiser pode me chamar!");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

// Responde a agradecimentos 
controller.hears(['Obrigada', 'Obrigado', 'Valeu', 'Vlw', 'Thanks', 'Grato'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        bot.reply(message, "Estou aqui para ajudar :)");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

function doRequest(userEmail){
    var strfromDate = (data.getMonth() + 1) + '/' + data.getDate() + '/' + data.getFullYear() + ' ' + data.getHours() + ':' + data.getMinutes();
    var strtoDate = (data.getMonth() + 1) + '/' + (data.getDate() + 1) + '/' + data.getFullYear() + ' 23:00';

    var options = { method: 'POST',
    url: 'https://10.3.161.171:9060/ers/config/guestuser',
    headers:
    { Authorization: 'Basic c3BvbnNvci11c2VyOlBAc3N3MHJk',
    'ERS-Media-Type': 'identity.guestuser.2.0',
    Accept: 'application/json',
    'Content-Type': 'application/json' },
    body:
    { GuestUser: {
        name: 'guest',
        guestType: 'Guest Type (Wireless Setup - Beta)',
        status: 'ACTIVE',
        sponsorUserName: 'sponsor-api',
        guestInfo:
        { userName: userEmail,
        firstName: '',
        lastName: '',
        emailAddress: userEmail,
        password: '2S@Guest195',
        creationTime: '',
        enabled: true,
        notificationLanguage: 'English',
        smsServiceProvider: 'Global Default' },
        guestAccessInfo: {
            validDays: 2,
            fromDate: strfromDate,
            toDate: strtoDate,
            location: 'San Jose' },
            portalId: 'bcd76bc2-8a3e-11e8-84e7-005056a65ea2',
            customFields: {}, 
            } 
        },
    json: true 
};

    request(options, function (error, response, body) {
    
    if (error) {
        console.log('### Error -> ' + error);
        throw new Error(error);
    }
        console.log('### Body -> ' + JSON.stringify(body));

    });
}


//easter egg 1
controller.hears(['Trouxa'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/)) {
        bot.reply(message, "Você que é.");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//easter egg 2
controller.hears(['Inovações'], 'direct_message,direct_mention', function(bot, message) {
    var verificaUser = message.user;
    if(verificaUser.match(/@2s.com.br/)) {
        bot.reply(message, "Voto Carneiro para presidente o/");
    } else {
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//easter egg 3
controller.hears(['Quem é sua mãe?'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, "Minha criadora se chama Bruna Toledo ;)");
});

//easter egg 4
controller.hears(['Severino'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, "Tò aquiiii");
});

//easter egg 5
controller.hears(['Marcelão'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, "Isso é uma bichoooooooooona");
});

//ACCESS_TOKEN=YTFhZjcwMGEtOWY5Yi00ZTFmLWJiMTEtYmI5YWZjNWNkNDIxNzdlMmE2MzktZmQz PUBLIC_URL= http://060d46af.ngrok.io node main.js
 