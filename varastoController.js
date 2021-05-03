'use strict'

const { registerDecorator } = require('handlebars');
var mysql = require('mysql');

var con = mysql.createConnection({
    host : 'localhost',
    port : 3306, 
    user : 'root',
    password : 'Ruutti',
    database: 'varasto'
});

module.exports = {                          //Haetaan data tietokannasta
    haeTavarataulukko: function () {
        return new Promise((resolve, reject) => {
            con.query('SELECT ID_tavara, tavara_nimi, määrä, lokero, hylly FROM tavara INNER JOIN hyllypaikka ON tavara.hyllypaikka_ID_hyllypaikka=hyllypaikka.ID_hyllypaikka INNER JOIN saldo ON tavara.ID_tavara=saldo.tavara_ID_tavara ORDER BY tavara.tavara_nimi', function (err, result, fields) {
                if (err) {
                    console.log("Virhe haettaessa dataa Tavarataulukko-taulusta, syy: " + err);
                    reject("Virhe haettaessa dataa Tavarataulukko-taulusta, syy: " + err);
                } else {
                    console.log("Tavarataulukko = " + JSON.stringify(result));
                    resolve(result);
                }
            })
        })
    },
    
    getTavaraAndSaldoById: function(req, res){ // tavaran tiedot lisäys ikkunaan, voi myös käyttää poisto ikkunassa
      var id = req.params.id;
      console.log(req.params.id);
      con.query("SELECT t.ID_tavara ID, t.tavara_nimi NIMI, s.määrä MAARA, h.lokero LOKERO, h.hylly HYLLY FROM tavara t JOIN saldo s ON(t.ID_tavara = s.ID_saldo) JOIN hyllypaikka h ON (h.ID_hyllypaikka = t.ID_tavara) WHERE t.ID_tavara = " + id, function(error, results, fields){
        if ( error ){
          console.log("Virhe tavaran otossa: " + error);
          res.status(500);
          res.json({"status:" : "ei toimii"});
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results);
        }
      })
    },

    tavaraLisaus: function(req, res){ // Tavaran määrän muuttaminen tietokannassa
      var id = req.params.id; // Tavaran ID osoitteesta
      var sql = "UPDATE tulo SET määrä='" + req.body.MAARA + "', tulo_päivämäärä=NOW(), toimittaja='" + req.body.TOIMITTAJA + "' WHERE ID_tulo=" + id + "; ";
      var sql2 = "UPDATE saldo SET määrä= määrä + " + req.body.MAARA + " WHERE ID_saldo=" + id + ";";
      con.query(sql, function(error, results, fields){ // päivitetään tulos taulukkoon
        if(error){
          console.log("Virhe tavaran  määrän päivittämisessä: " + error);
          res.status(500);
          res.json({"status:" : "ei toimii"});
        }
        else{ // jos onnistui
          try{
            con.query(sql2, function(error, results, fields){ // päivitetään tulos taulukkoon
              if(error){
                console.log("Virhe tavaran  määrän päivittämisessä: " + error);
                res.status(500);
                res.json({"status:" : "ei toimii"});
              }
              else{
                res.json("Tavaran määrä päivitetty");
                res.status(202);
              }
            })
          }
          catch{
            console.log("Virhe saldossa tavaran määrän päivittämisessä: " + error);
            res.status(500);
            res.json({"status:" : "ei toimii"});
          }
        }
      });
    },

    tavaranPoistaminen: function(req, res){ // Tavaran määrän muuttaminen tietokannassa
      var id = req.params.id; // Tavaran ID osoitteesta
      console.log(req.body.POISTOMAARA + "     " + req.body.KAYTTAJA);
      var sql = "UPDATE meno SET määrä='" + req.body.POISTOMAARA + "', meno_päivämäärä=NOW(), Käyttäjä='" + req.body.KAYTTAJA + "' WHERE ID_meno=" + id + "; ";
      var sql2 = "UPDATE saldo SET määrä= määrä - " + req.body.POISTOMAARA + " WHERE ID_saldo=" + id + ";";
      con.query(sql, function(error, results, fields){ // päivitetään tulos taulukkoon
        if(error){
          console.log("Virhe tavaran määrän päivittämisessä: " + error);
          res.status(500);
          res.json({"status:" : "ei toimi"});
        }
        else{ // jos onnistui
          try{
            con.query(sql2, function(error, results, fields){ // päivitetään tulos taulukkoon
              if(error){
                console.log("Virhe tavaran määrän päivittämisessä: " + error);
                res.status(500);
                res.json({"status:" : "ei toimii"});
              }
              else{
                res.json("Tavaran määrä päivitetty");
                res.status(202);
              }
            })
          }
          catch{
            console.log("Virhe saldossa tavaran määrän päivittämisessä: " + error);
            res.status(500);
            res.json({"status:" : "ei toimii"});
          }
        }
      });
    },

    /* Kehitystä varten
    uusiTavara: function(){

    },

    getHyllytbyKoko: function(req, res){ // Kesken
      var koko = req.body.KOKO;
      connection.query('SELECT hylly, lokero, ID_hyllypaikka FROM hyllypaikka WHERE paikka_koko', function(error, results, fields){
        if ( error ){
          console.log("Virhe haettaessa data asiakas-taulusta: " + error);
          res.status(500);
          res.json({"status:" : "ei toimii"});
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results);
        }
    });
    }*/

 }