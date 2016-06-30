var app = angular.module('KwickApp', ['ngStorage', 'ngMessages']);
// Définition du contrôleur de gestion du compte
app.controller('kwickCtrl', ['$http', '$localStorage', function ($http, $localStorage) {
    // Pour la création d'un compte
    this.signUp = function (username, password) {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/signup/' + username + '/' + password + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.kwickToken = response.result.token;
                $localStorage.kwickId = response.result.id;
                $localStorage.username = username;
                $localStorage.lastTimesTamp = Math.round(new Date().getTime() / 1000);
                window.location = "/tchat.html";
            }
        }).error(function (response) {

        });
    };
    // Pour la connexion
    this.signIn = function (username, password) {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/login/' + username + '/' + password + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.kwickToken = response.result.token;
                $localStorage.kwickId = response.result.id;
                $localStorage.username = username;
                $localStorage.lastTimesTamp = Math.round(new Date().getTime() / 1000);
                window.location = "/tchat.html";
            }
        }).error(function (response) {

        });
    };
    // Pour la déconnexion
    this.logOut = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/logout/' + $localStorage.kwickToken + '/' + $localStorage.kwickId + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            if (response.result.status == "done") {
                $localStorage.$reset();
                window.location = "index.html";
            }
        }).error(function (response) {
            console.log("erreur vous n'etes pas déconnecté !")
        });
    };
}]);
// Définition du contrôleur pour voir les utilisateur connectées
app.controller('kwickTchatCtrl', ['$http', '$localStorage', function ($http, $localStorage) {
    this.UsersConnected = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/user/logged/' + $localStorage.kwickToken + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var getUsers = response.result.user;
            var listUsers = [];
            for (var i = 0; i < getUsers.length; i++) {
                listUsers.push('<li><a>' + getUsers[i] + '</a></li>');
            }
            $('.sidebar-nav').append(listUsers);
            $('.you').append(' ' + $localStorage.username);
        }).error(function (response) {
        });
    };
    this.UsersConnected();
}]);
// Définition du contrôleur pour listés les messages
app.controller('kwickMessagesCtrl', ['$http', '$localStorage', '$interval', function ($http, $localStorage, $interval) {
    var that = this;
    // Fonction de conversion du timestamp
    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    this.listMessages = function () {
        $localStorage.lastTimesTamp = Math.round(new Date().getTime() / 1000);
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/talk/list/' + $localStorage.kwickToken + '/' + $localStorage.lastTimesTamp + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var table = response.result.talk;
            if (table.length > 0) {
                $localStorage.lastTimesTamp = response.result.last_timestamp;
                for (var i = 0; i < table.length; i++) {
                    $('.all-messages').append('<h2>' +
                        '<span class="glyphicon glyphicon-user" aria-hidden="true" style="padding-right: 10px;"></span>'
                        + table[i].user_name +
                        '</h2>'
                        + '<p> dit : </p>'
                        + '<p class="message-content">'
                        + table[i].content
                        + '</p>'
                        + '<span class="glyphicon glyphicon-time"></span> '
                        + timeConverter(table[i].timestamp));
                }
            }
            if (table > 0) {
                // nothing
            } else {
                $('.all-messages').animate({scrollTop: $('.all-messages')[0].scrollHeight}, 600);
            }
        }).error(function (response) {

        });
    };
    this.listMessages();

    this.sayMessages = function (message) {
        var messageURI = encodeURIComponent(message);
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/say/' + $localStorage.kwickToken + '/' + $localStorage.kwickId + '/' + messageURI + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            that.refreshMessages();
            that.message = '';
        }).error(function (response) {

        });
    };

    // Fonction de rafraichissement des messages
    this.refreshMessages = function () {
        $http({
            method: 'JSONP',
            url: 'http://greenvelvet.alwaysdata.net/kwick/api/talk/list/' + $localStorage.kwickToken + '/' + $localStorage.lastTimesTamp + '?callback=JSON_CALLBACK'
        }).success(function (response) {
            var table = response.result.talk;
            if (table.length > 0) {
                $localStorage.lastTimesTamp = response.result.last_timestamp;
                for (var i = 0; i < table.length; i++) {
                    $('.all-messages').append('<h2>' +
                        '<span class="glyphicon glyphicon-user" aria-hidden="true" style="padding-right: 10px;"></span>'
                        + table[i].user_name +
                        '</h2>'
                        + ' dit : '
                        + '<p>'
                        + table[i].content
                        + '</p>'
                        + ' le : '
                        + timeConverter(table[i].timestamp));
                }
                $localStorage.lastTimesTamp = response.result.last_timestamp;
                if (table > 0) {
                    // nothing
                } else {
                    $('.all-messages').animate({scrollTop: $('.all-messages')[0].scrollHeight}, 600);
                }
            }
        }).error(function (response) {

        });
    };
    setInterval(function () {
        that.refreshMessages();
    }, 3000);
    //$interval(that.refreshMessages(), 5000);
}]);


