$(function() {
    var socket = io();
    document.onkeydown = down;
    document.onkeyup = up;
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');
    var character = {
        w : false,
        a : false,
        s : false,
        d : false
    }
    var movement;
    function down(e) {
        if(e.keyCode == 87 || e.keyCode == 38) {
            character.w = true;
        }
        if(e.keyCode == 65 || e.keyCode == 37) {
            character.a = true;
        }
        if(e.keyCode == 83 || e.keyCode == 40) {
            character.s = true;
        }
        if(e.keyCode == 68 || e.keyCode == 39) {
            character.d = true;
        }
        socket.emit("move", character);
    }
    function up(e) {
        if(e.keyCode == 87 || e.keyCode == 38) {
            character.w = false;
        }
        if(e.keyCode == 65 || e.keyCode == 37) {
            character.a = false;
        }
        if(e.keyCode == 83 || e.keyCode == 40) {
            character.s = false;
        }
        if(e.keyCode == 68 || e.keyCode == 39) {
            character.d = false;
        }
        socket.emit("move", character);
    }
    socket.on("draw", function(data) {
        canvas.width=canvas.width;
        for(var i = 0; i < data.heroes.length; i++) {
            if(data.heroes[i].active == true) {
                if(data.heroes[i].team == 0) {
                    ctx.fillStyle = "#1E90FF"
                    ctx.fillRect(data.heroes[i].x, data.heroes[i].y, 20, 20)
                } else {
                    ctx.fillStyle = "#ED4337"
                    ctx.fillRect(data.heroes[i].x, data.heroes[i].y, 20, 20)
                }
            }
        }
        ctx.beginPath();
        ctx.strokeStyle = "#000000"
        ctx.moveTo(500, 0);
        ctx.lineTo(500, 500);
        ctx.stroke();
        if(data.flags[0].on == "") {
            ctx.strokeStyle = "#1E90FF"
            ctx.strokeRect(100, 240, 20, 20); 
        } else {
            ctx.strokeStyle = "#1E90FF"
            ctx.strokeRect(data.flags[0].on.x, data.flags[0].on.y, 20, 20); 
        }
        if(data.flags[1].on == "") {
            ctx.strokeStyle = "#ED4337"
            ctx.strokeRect(870, 240, 20, 20);
        } else {
            ctx.strokeStyle = "#ED4337"
            ctx.strokeRect(data.flags[1].on.x, data.flags[1].on.y, 20, 20); 
        }
        ctx.font = "40px Ubuntu Mono";
        ctx.fillStyle = "blue";
        ctx.fillText(data.score.blue, 470, 40);
        ctx.fillStyle = "red";
        ctx.fillText(data.score.red, 510, 40);
    })
});