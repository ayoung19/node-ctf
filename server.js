// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var speed = 5;
var activeGame = true;
function createHero(x, y) {
    var hero = {
        w : false,
        a : false,
        s : false,
        d : false,
        xStart : x,
        yStart : y,
        x : x,
        y : y,
        active : false,
        id : "",
        team : "",
        name : ""
    }
    return hero;
}
var hero1 = createHero(240, 115);
var hero2 = createHero(240, 240);
var hero3 = createHero(240, 365);
var hero4 = createHero(760, 115);
var hero5 = createHero(760, 240);
var hero6 = createHero(760, 365);

var blueFlag = {
    x : 100,
    y : 240,
    on : ""
}
var redFlag = {
    x : 870,
    y : 240,
    on : ""
}
var team = {
    blue : 0,
    red : 1
}
var score = {
    blue : 0,
    red : 0
}
var flags = [blueFlag, redFlag]
var allHeroes = [hero2, hero5, hero1, hero4, hero3, hero6];
var heroesOn = [];

function available() {
    for(var i = 0; i < allHeroes.length; i++) {
        if(allHeroes[i].active == false) {
            return i;
        }
    }
}
function findHero(clientId) {
    for(var i = 0; i < heroesOn.length; i++) {
        if(heroesOn[i].id == clientId) {
            return i;
        }
    }
}

io.on('connection', function (socket) {
    var socketId = socket.id;
    var nextAvailable = available();
    allHeroes[nextAvailable].id = socket.id;
    allHeroes[nextAvailable].active = true;
    if(nextAvailable % 2 == 0) {
        allHeroes[nextAvailable].team = team.blue
    } else {
        allHeroes[nextAvailable].team = team.red
    }
    heroesOn.push(allHeroes[nextAvailable]);
    socket.on("move", function(data) {
        var user = findHero(socket.id);
        if(heroesOn[user] != undefined) {
            heroesOn[user].w = data.w
            heroesOn[user].a = data.a
            heroesOn[user].s = data.s
            heroesOn[user].d = data.d
        }
    })
    socket.on('disconnect', function () {
        var missingHero = findHero(socket.id);
        if(heroesOn[missingHero] != undefined) {
            heroesOn[missingHero].active = false;
            heroesOn[missingHero].id = "";
            heroesOn[missingHero].x = heroesOn[missingHero].xStart;
            heroesOn[missingHero].y = heroesOn[missingHero].yStart;
            heroesOn.splice(missingHero, 1)
        }
    });
})
setInterval(updateCoords, 1000/60)

function updateCoords() {
    for(var i = 0; i < heroesOn.length; i++) {
        if(activeGame == true && heroesOn[i] != undefined) {
            if(heroesOn[i].x < 1 || heroesOn[i].x <= flags[heroesOn[i].team].x + 20 && heroesOn[i].x + 15 >= flags[heroesOn[i].team].x && heroesOn[i].y + 15 >= flags[heroesOn[i].team].y && heroesOn[i].y <= flags[heroesOn[i].team].y + 15 && flags[heroesOn[i].team].on == "") {
                //heroesOn[i].a = false;
            } else if(heroesOn[i].a == true) {
                heroesOn[i].x = heroesOn[i].x - speed
            }
            if(heroesOn[i].y < 1 || heroesOn[i].y <= flags[heroesOn[i].team].y + 20 && heroesOn[i].y + 15 >= flags[heroesOn[i].team].y && heroesOn[i].x + 15 >= flags[heroesOn[i].team].x && heroesOn[i].x <= flags[heroesOn[i].team].x + 15 && flags[heroesOn[i].team].on == "") {
                //heroesOn[i].w = false;
            } else if(heroesOn[i].w == true) {
                heroesOn[i].y = heroesOn[i].y - speed
            }
            if(heroesOn[i].y > 475 || heroesOn[i].y + 20 >= flags[heroesOn[i].team].y && heroesOn[i].y <= flags[heroesOn[i].team].y + 15 && heroesOn[i].x + 15 >= flags[heroesOn[i].team].x && heroesOn[i].x <= flags[heroesOn[i].team].x + 15 && flags[heroesOn[i].team].on == "") {
                //heroesOn[i].a = false;
            } else if(heroesOn[i].s == true) {
                heroesOn[i].y = heroesOn[i].y + speed
            }

            if(heroesOn[i].x > 975 || heroesOn[i].x + 20 >= flags[heroesOn[i].team].x && heroesOn[i].x <= flags[heroesOn[i].team].x + 15 && heroesOn[i].y + 15 >= flags[heroesOn[i].team].y && heroesOn[i].y <= flags[heroesOn[i].team].y + 15 && flags[heroesOn[i].team].on == "") {
                //heroesOn[i].a = false;
            } else if(heroesOn[i].d == true) {
                heroesOn[i].x = heroesOn[i].x + speed
            }
            if(heroesOn[i].x + 20 > flags[1 - heroesOn[i].team].x && heroesOn[i].x < flags[1 - heroesOn[i].team].x + 20 && heroesOn[i].y + 20 > flags[1 - heroesOn[i].team].y && heroesOn[i].y < flags[1 - heroesOn[i].team].y + 20) {
                flags[1 - heroesOn[i].team].on = heroesOn[i];
            }
            if(checkConflict(heroesOn[i].x, heroesOn[i].y) != undefined) {
                var enemyHero = checkConflict(heroesOn[i].x, heroesOn[i].y);
                if(heroesOn[i].team != heroesOn[enemyHero].team) {
                    if(heroesOn[i].team == team.blue && heroesOn[i].x > 500 || heroesOn[i].team == team.red && heroesOn[i].x < 500) {
                        for(var j = 0; j < 2; j++) {
                            if(flags[j].on == heroesOn[i]) {
                                flagRespawn(flags[j])
                            }
                        }
                        respawn(heroesOn[i]);
                    }
                }
            }
        }
    }
    if(redFlag.on.x < 500) {
        flagRespawn(redFlag)
        score.blue++;
    }
    if(blueFlag.on.x + 20 > 500) {
        flagRespawn(blueFlag)
        score.red++;
    }
    if(score.blue == 5 || score.red == 5) {
        score.blue = 0;
        score.red = 0;
    }
    io.sockets.emit("draw", {heroes : heroesOn, flags : flags, score : score});
}
function respawn(object) {
    object.x = object.xStart;
    object.y = object.yStart;
}
function flagRespawn(flag) {
    flag.on = ""
}
function checkConflict(x, y) {
    var matches = 0;
    for(var i = 0; i < heroesOn.length; i++) {
       if(x + 20 >= heroesOn[i].x && x <= heroesOn[i].x + 20 && y + 20 >= heroesOn[i].y && y <= heroesOn[i].y + 20 && heroesOn[i].active == true) {
           if(x == heroesOn[i].x && y == heroesOn[i].y) {
           } else {
               return i;
           }
       }
    }
}