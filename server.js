'use strict'

var express = require('express');
var cons = require('consolidate');

const http = require('http');
const url = require('url');
const { read } = require('fs');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

var varastoController = require('./varastoController'); // kontrolleri jolla saadaan tiedot tietokantaan ja tietokannasta 
var path = require('path');
var app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Lupaa sivun käyttää POST, GET, DELETE jne. metodeja
  next();
});


var bodyParser = require('body-parser'); // 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/views')); 
app.use(express.static('views/images')); // kuvia varten

app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views',path.join(__dirname) + '/views');

var handlebars = require('handlebars');
const { get } = require('http');
handlebars.registerHelper('sijoitus', function (index) {
    return index + 1;
});

// Näytetään "etusivu"
app.get('/', function (req, res) {
    res.render('index', {
    });
});

// Haetaan Tavarataulukko
app.get('/Tavarataulukko', function (req, res) {
    varastoController.haeTavarataulukko().
        then(data => {
            res.render('Tavarataulukko', {
                Tavarataulukko: data
            });
        }).catch(err => {
            console.log("Virhe: " + JSON.stringify(err));
        });
});

// Tavaran poisto ja lisäminen
app.route('/tavara/:id')
  .post(varastoController.tavaraLisaus) // Lisäystä varten
  .get(varastoController.getTavaraAndSaldoById); // Tavaran tiedot dialog ikkunaan

app.route('/poisto/tavara/:id')
  .post(varastoController.tavaranPoistaminen); // Poistoa varten

/* Uutta tavara lisäystä varten(jatkokehitystä varten)  
app.route('add/tuote/')
  .post(varastoController.uusiTavara);

app.route('/hyllyt/')
  .get(varastoController.getHyllytbyKoko);*/


// 404 virhettä, jos kutsu ei täsmää edellä oleviin osoitteisiin
app.use(function (req, res, next) {
    res.sendStatus(404);
});

// Kuunnellaan porttia 3000 osoitteessa 127.0.0.1
app.listen(port, hostname, () => {
  console.log(`Server running AT http://${hostname}:${port}/`);
});;