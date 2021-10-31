const express = require('express')
const app = express()
cookieParser = require('cookie-parser')
const fs = require('fs');
const { join } = require("path");

const port = 3000

const files  = join(__dirname, 'files');

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
    };

app.use(cookieParser('secret key'))

app.post('/auth', (req, res) => {
    let data = '';
    req.on('data', chunk => {
    data += chunk;
    });
    req.on('end', () => {
        let dataParse = JSON.parse(data);
        if(dataParse.username===user.username && dataParse.password===user.password){
            res.cookie('userId', user.id, {
                maxAge: 1000*60*60*24*2,
            })
            res.cookie('authorized', true, {
                maxAge: 1000*60*60*24*2,
            })
            res.send('Set Cookie')
        }else{
            res.status(400);
            res.send('Неверный логин или пароль')
        }
    });
})

app.get('/get', (req, res) => {  
    try{
        const links = fs.readdirSync(files)
        .map(item => `${item} `)
        .join("");
        res.type('text/html');
        res.status(200)
        return res.send(links);
    }catch (err) {
        console.error(err)
        res.status(500);
        return res.send('Internal server error');
    }
})

app.delete('/delete', (req, res) => {
    if(req.cookies.authorized == 'true'&&req.cookies.userId == user.id ){
            let data = '';
            req.on('data', chunk => {
            data += chunk;
            });
            req.on('end', () => {
                let {filename} = JSON.parse(data);
                fs.access(join(files, filename), fs.constants.F_OK, (ok) => {
                    if(ok){
                        res.type('text/html');
                        res.status(409)
                        return res.send(`файл с именем ${filename} не существует`);
                    }else{
                        fs.unlink(join(files, filename), (err) => console.log(err));
                        res.type('text/html');
                        return res.send('файл с именем ${filename} удален');
                    }
                });
            });  
    }else{
    res.type('text/html');
    return res.send('не атворизован');}
})

app.post('/post', (req, res) => {
    if(req.cookies.authorized == 'true'&&req.cookies.userId == user.id ){
            let data = '';
            req.on('data', chunk => {
            data += chunk;
            });
            req.on('end', () => {
                let {filename, content} = JSON.parse(data);
                fs.access(join(files, filename), fs.constants.F_OK, (ok) => {
                    if(ok){
                        fs.writeFile(join(files, filename), content, (err) => console.log(err));
                        res.type('text/html');
                        return res.send('success');
                    }else{
                        res.type('text/html');
                        res.status(409)
                        return res.send(`файл с именем ${filename} уже существует`);
                    }
                });
            });  
    }else{
    res.type('text/html');
    return res.send('не атворизован');}
})

app.get('/redirect', (req, res) => {
    return res.redirect(301, '/redirected')
})

app.get('/redirected', (req, res) => {
    res.type('text/html');
    return res.send('Ресурс теперь постоянно доступен по адресу /redirected');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})