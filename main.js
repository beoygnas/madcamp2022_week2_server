
const mysql = require('mysql');
const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const multer = require('multer');
const fs = require('fs');

const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const { join } = require('path');
const io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static("pictures"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "src")));


server.listen(80, function () {
    const dir = './pictures';
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log('서버 실행중...');
});


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "developwith_db",
    password: "9240",
    port: 3306
});


var room = new Array();
var dict= {};

connection.query('select chat_id from chatroom_list', function(err, result){
    if(err){
        console.log(err);
    }
    for(var i = 0; i<result.length ;i++){
        room[i] = "room" + Object.values(result[i])[0];
        dict[`room${Object.values(result[i])[0]}`] = new Set();
    }
});


io.on("connection", (socket)=>{
    
    socket.on('connection', (chat_id, name, email) =>{
        var roomidx = room.indexOf(`room${chat_id}`);
        var onconnected = new Array();

        console.log(`접속완료 : ${chat_id} / ${name} / ${email} / ${room[roomidx]}`);
        socket.join(room[room.indexOf(`room${chat_id}`)]);
        dict[`room${chat_id}`].add(name); 
        
        onconnected = Array.from(Object.values(dict)[roomidx]); 
        io.to(room[room.indexOf(`room${chat_id}`)]).emit('connection', name, email, onconnected);
    });

    socket.on('disconnection', (chat_id, name, email) =>{
        var roomidx = room.indexOf(`room${chat_id}`);
        var onconnected = new Array();

        console.log(`접속해제 : ${chat_id} / ${name} / ${email} / ${room[room.indexOf(`room${chat_id}`)]}`);
        socket.leave(room[chat_id]);
        dict[`room${chat_id}`].delete(name); 

        onconnected = Array.from(Object.values(dict)[roomidx]); 
        io.to(room[room.indexOf(`room${chat_id}`)]).emit('disconnection', name, email, onconnected);
    });
    
    socket.on("new message", (addmsg, chat_id, name, regdata) =>{
        
        var sql = `insert into chatmsg${chat_id} values(?, null, ?, ?, ?)`;
        var params = [chat_id, addmsg, regdata, name];
        
        connection.query(sql, params, function(err){
            var resultcode = 404;
            if(err){
                console.log(err);
            }
            else{
                resultcode = 200;
            }
        });

        var sql1 = `update chatroom_list set lastchat = "${addmsg}" where chat_id = ${chat_id}`;
        connection.query(sql1, function(err){
            if(err){
                console.log(err);
            }
        });
        
        var sql2 = `update chatroom_list set regdata = "${regdata}" where chat_id = ${chat_id}`;
        connection.query(sql2, function(err){
            if(err){
                console.log(err);
            }
        });

        io.to(room[room.indexOf(`room${chat_id}`)]).emit('new message');
    });
});


app.post('/user/login', function (req, res){
    var userEmail = req.body.userEmail;
    var sql = 'select email from user where email = ?';
    // var sql2 = 'select * from tmp2 where id2 = ?';

    connection.query(sql, userEmail, function(err, result){
        var resultcode = 404;
        //var message = "error"
        if(err){
            console.log(err);
        }
        else{
            if(result.length == 0){                
                resultcode = 204;
            }
            else{
                resultcode = 200;
            }
        }
        res.json({
            'code': resultcode
        });
    })
});

//user add -> if result code == 204
app.post('/user/signup', function(req, res){
    
    //add informations for register
    var name = req.body.userName;
    var email = req.body.userEmail;
    var age = req.body.userAge;
    var gender = req.body.userGender;
    var phonenum = req.body.userPhonenum;
    var level = req.body.userLevel;
    var field = req.body.userField;
    var msg = req.body.userMsg;
    var sql = 'insert into user (name, email, age, gender, phonenum, level, field, msg) values(?,?,?,?,?,?,?,?)';
    var params = [name, email, age, gender, phonenum, level, field, msg];
    connection.query(sql, params, function(err, result){
        var resultcode = 404;
        
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
        }
        res.json({
            'code': resultcode
        });
    });
});

app.get('/user/getproject', function (req, res){
    
    var sql = 'select * from project order by proj_id desc';
    connection.query(sql, [], function(err, result){
        if(err){
            console.log(err);
        }
        
        res.json(result);
    })
});

app.post('/user/getmyproject', function (req, res){
    
    var email = req.body.userEmail;
    var sql = 'select * from project where writer_email = ? order by proj_id desc';
    connection.query(sql, email, function(err, result){
        if(err){
            console.log(err);
        }
        res.json(result);
    })
});

app.post('/user/deleteproject', function (req, res){
    
    var proj_id = req.body.proj_id;
    var sql = 'delete from project where proj_id = ?';
    connection.query(sql, proj_id, function(err, result){
        
        var resultcode = 404;
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
        }
        res.json({
            'code': resultcode
        });
    });
});

app.post('/user/addproject', function(req, res){
    
    //add informations for register
    var id = req.body.id;
    var writer = req.body.writer;
    var writer_email = req.body.writer_email;
    var title = req.body.title;
    var content = req.body.content;
    var field = req.body.field;
    var level = req.body.level;
    var headcount = req.body.headcount;
    var language = req.body.language;
    var time = req.body.time;
    var regdata = req.body.regdata;

    var sql = 'insert into project values(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [writer, writer_email, title, content, field, level, headcount, language, time, regdata];

    var resultcode = 404;
    var proj_id = 0;
    connection.query(sql, params, function(err, result){
        
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
        }
        
    });

    var sql2 = 'select proj_id from project where regdata = ?';
    connection.query(sql2, regdata, function(err, result){
        if(err){
            console.log(err);
        }
        else{
    
            proj_id = Object.values(result[0])[0];
    
            room.push(`room${proj_id}`);
            dict[`room${proj_id}`] = new Set();

            var sql3 = `insert into chatroom_list values(${proj_id}, "${title}", "안녕하세요. [${title}] 프로젝트 단톡방입니다.", "${regdata}");`;
            connection.query(sql3, function(err, result){
                if(err){
                    console.log(err);
                }
            });

            var sql4 =  `insert into chatroom_member values(${proj_id}, "${writer}", "${writer_email}");`;
            connection.query(sql4, function(err, result){
                if(err){
                    console.log(err);
                }
            });

            
            var sql5 = `create table chatmsg${proj_id}(
                chat_id int,
                msg_id  int AUTO_INCREMENT primary key,
                msg		varchar(50),
                regdata varchar(50),
                sender_name varchar(50)
            ); `;
            connection.query(sql5, function(err, result){
                if(err){
                    console.log(err);
                }
            });
            
            var sql6 = `insert into chatmsg${proj_id} values(${proj_id}, null, "안녕하세요. [${title}] 프로젝트 단톡방입니다.", 20220708110024, "${writer}");`;
            connection.query(sql6, function(err, result){
                if(err){
                    console.log(err);
                }
            });

            connection.query('select chat_id from chatroom_list', function(err, result){
                if(err){
                    console.log(err);
                }
                for(var i = 0; i<result.length ;i++){
                    room[i] = "room" + Object.values(result[i])[0];
                }
            });
        }
        res.json({
            'code': resultcode,
            'proj_id': Object.values(result[0])[0]
        });
    });

    
});


//게시글 추가 -> 성공 여부 반환
app.post('/user/addboard', function(req, res){
    //var doc_id = req.body.doc_id;
    var writer = req.body.writer;
    var writer_email = req.body.writer_email;
    var type = req.body.type;
    var title = req.body.title;
    var content = req.body.content;
    var regdata = req.body.regdata;
    //var picture = req.body.picture;

    var sql = 'insert into document (writer, writer_email, type, title, content, regdata) values(?,?,?,?,?,?)';
    var params = [writer, writer_email, type, title, content, regdata];

    connection.query(sql, params, function(err, result){
        var resultcode = 404;
        var message = "error";
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
            message = 'Successfully posted!';
        }

        connection.query(`select doc_id from document where regdata = ${regdata};`, function(err, result){
            if(err) console.log(err);
            console.log(result);
            res.json(result);
        });
    });



});

//게시글 받아오기 -> 객체 반환 -> board recyclerview
app.get('/user/returnboards', function(req, res){
    var sql = 'select * from document order by doc_id desc';
    connection.query(sql, (err, results, fields) => {
        if(err) throw err;
        
        res.json(results);
    });
});


//게시글 삭제하기 -> 성공여부 반환
app.post('/user/deleteboard', function(req, res){
    var param =  req.body.doc_id;
    var sql = 'delete from document where doc_id=?';
    connection.query(sql, param, (err, result) => {
        var resultcode = 404;
        var message = "error";
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
            message = 'Successfully deleted!';
        }
        res.json({
            'code': resultcode,
            'message':message
        });
    });
});

app.post('/user/getchatroom', function (req, res){
    
    var email = req.body.email;
    var sql = `select chat_id, chat_name, lastchat, regdata from chatroom_member inner join chatroom_list using (chat_id) where email = "${email}" order by regdata desc`;
    connection.query(sql, function(err, result){
        if(err){
            console.log(err);
        }
        res.json(result);
    })
});

app.post('/user/addchatroommember', function(req, res){

    var chat_id = req.body.chat_id;
    var name = req.body.name;
    var email = req.body.email;
    var regdata = req.body.regdata;


    var sql0 = `select email from chatroom_member where chat_id = ${chat_id} and email = "${email}";`;
    connection.query(sql0, function(err, result){
        var resultcode = 200;
        if(err){
            console.log(err);
        }
        else{
            console.log(Object.values(result));
            if(Object.values(result).length == 0){           
                var sql1 = `insert into chatroom_member values(${chat_id}, "${name}", "${email}");`;
                connection.query(sql1, function(err, result){
                    resultcode = 404;
                    if(err){
                        console.log(err);
                    }
                });
            }
        }

        res.json({
            'code': resultcode
        });
    });
});

//댓글 추가 -> 성공여부 code
app.post('/user/addcomment', function(req, res){
    var content = req.body.content;
    var regdata = req.body.regdata;
    var writer_email = req.body.writer_email;
    var writer = req.body.writer;
    var doc_id = req.body.doc_id;

    var sql = 'insert into comment values(null, ?,?,?,?,?)';
    var params = [doc_id, regdata, writer, writer_email, content];
    connection.query(sql, params, function(err, result){
        var resultcode = 404;
        if(err){
            console.log(err);
        }
        else{
            resultcode = 200;
        }
        res.json({
            'code': resultcode
        });
    });
});

//detail board에서 댓글들 recyclerview로 보여주기
app.post('/user/getcomment', function(req, res){
    var param = req.body.doc_id;
    var sql = 'select * from comment where doc_id=? order by regdata';
    connection.query(sql, param, function(err, results, fields){
        if(err) throw err;
        res.json(results);
    });
});


app.post('/user/getchatmsg', function (req, res){
    
    var chat_id = req.body.chat_id;
    var sql = `select * from chatmsg${chat_id} order by msg_id`;
    connection.query(sql, chat_id, function(err, result){
        if(err){
            
            console.log(err);
        }
        res.json(result);
    })
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'pictures/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({storage: storage});

app.post('/user/imageadd', upload.single('picture'), (req, res, next) => {

    
    var sql = `update document set picture = "http://192.249.19.191:80/${req.file.filename}`;

    connection.query(sql, function(err, result){
        if(err){
            console.log(err);
        }
    });
    res.status(201).send({
        fileInfo: req.files
    });

});
