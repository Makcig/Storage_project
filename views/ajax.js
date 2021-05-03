$(document).ready(function () {
    $("#tuotteet").load("http://localhost:3000/Tavarataulukko", function () {    //Haetaan tuotteet-taulukkoon dataa tietokannasta
        console.log('Tavarataulukko haettu.');
    });

    $('.plan').show();
    
    $('.part').click(hoverOrClick).hover(hoverOrClick); // hover klikillä sekä hiirellä


    //$(function () {
    $('#showPlan').on('click', function(){
        $('.description').hide();   
        $('div[class^="map"]').hide(); //Näytetään vain yht_kartta, entä tuotteen kartta hävitetään
        $('.plan').show();
        $('#tulosTable').hide();
        $('#buttonstable').hide();
    });

    // Tavaran lisääminen 
    
    lisaa = (id) =>{
        $.ajax({
            url: `http://localhost:3000/tavara/` + id, // Haetaan tavaran tiedot
            type: 'GET',
            success: (result) => {
                result.forEach(element => { // Täyttää lisäys-ikkunaan valitun tavaran tiedot
                    $("#TAVARA_ID_add").text(element.ID);
                    $("#TAVARA_SALDO_add").text(element.MAARA);
                    $("#TAVARA_NIMI_add").text(element.NIMI);
                    console.log("Tavaran tiedot haettu");
                    return;
                })
            },
            error: (function(result){
                console.log("Virhe haettaessa");
                alert("Palvelimella tapahtunut virhe: " + result.status);
            })
        });
        lisaus.data("id", id).dialog( "open" ); // Avaa lisäys-ikkunan
    }
    lisaus = $( "#dialog-add" ).dialog({
        autoOpen: false,    //ikkunan ominaisuudet
        height: 'auto',
        width: 500,
        modal: true,
        dialogClass: 'no-close',
        buttons: [
            {
                text: "Lisää",
                type: "button",
                class: "btn btn-success",
                click: function () { // Ikkunan "lisää" painikkeen toiminto
                    if ($('#lisaus').valid()) {
                        $.ajax({
                            type: "POST", // metodi
                            url: "http://localhost:3000/tavara/" + $(this).data("id"), //metodin osoite
                            data: $(`form#lisaus`).serialize(), // Ikkunasta määrän ja toimittajan inputien sisältö
                            success: function(result){ 
                                $("#tuotteet").load("http://localhost:3000/Tavarataulukko");
                                document.querySelector('#saldo').innerHTML = parseInt(document.querySelector('#saldo').innerHTML) + parseInt(document.getElementById('maaraalue').value);
                                document.getElementById('maaraalue').value = ""; // Tyhjentää ikkunan inputin
                                document.getElementById('toimittajaalue').value = "";
                                lisaus.dialog( "close" ); // Sulje ikkuna
                                $('#ToastLisaus').toast('show');
                            },
                            error: function(data){
                                alert("Jotain epäonnistunut status: " + data.status); // ilmoittaa jos ei onnistunut
                            }
                        })
                    }
                },
            },
            {
                text: "Keskeytä", // peruutus
                class: "btn btn-outline-secondary",
                click: function() {
                    document.getElementById('maaraalue').value = ""; // Tyhjentää ikkunan inputin
                    document.getElementById('toimittajaalue').value = "";
                    $( this ).dialog( "close" );
                }
            }
        ],
    });

    $('#lisaus').validate({ // Lisäys tarkistus
        
        rules: {
            MAARA: {
                required: true, // määrä kenttä on pakollinen
                digits: true,   // vaan numerona   
                min: 1,         // minimimäärä on 1
            },
            TOIMITTAJA:{
                required: true, // Toimittaja on pakollinen
                maxlength: 45
            }
        },
        messages: { // virheviestit
            MAARA: {
                required: "'Määrä' kenttä on pakollinen",
                digits: "Vaan numerona",
                min: "Minimimäärä on 1",
            },
            TOIMITTAJA: {
                required: "'Toimittaja' kenttä on pakollinen",
                maxlength: "Liian pitkä nimi"
            }
        },
        errorElement : 'label'
    });

    // Tavaran poistaminen
    
    poista = (id) =>{
        $.ajax({
            url: `http://localhost:3000/tavara/` + id, //haetaan tavaran tiedot
            type: 'GET',
            success: (result) => {
                result.forEach(element => { // Täyttää poisto-ikkunaan valitun tavaran tiedot
                    $("#TAVARA_ID_remove").text(element.ID);
                    $("#TAVARA_SALDO_remove").text(element.MAARA);
                    $("#TAVARA_NIMI_remove").text(element.NIMI);
                    console.log("Tavaran tiedot haettu");
                    return;
                })
            },
            error: (function(result){
                console.log("Virhe haettaessa tietoja");
                alert("Palvelimella tapahtunut virhe: " + result.status);
            })
        });
        poistaminen.data("id", id).dialog( "open" ); //avaa poisto ikkunan
    }
    poistaminen = $( "#dialog-remove" ).dialog({
        autoOpen: false,    //ikkunan ominaisuudet
        height: 'auto',
        width: '500',
        modal: true,
        dialogClass: 'no-close',
        buttons: [
            {
                text: "Poista",
                type: "button",
                class: "btn btn-success",
                click: function(){ // Ikkunan "poista" painikkeen toiminto
                    if ($('#poistaminen').valid()) {

                        $.ajax({
                            type: "POST", // metodi
                            url: "http://localhost:3000/poisto/tavara/" + $(this).data("id"), //metodin osoite
                            data: $(`form#poistaminen`).serialize(), // Ikkunassa määrän ja käyttäjän inputien sisältö
                            success: function(result){
                                $("#tuotteet").load("http://localhost:3000/Tavarataulukko");
                                document.querySelector('#saldo').innerHTML = parseInt(document.querySelector('#saldo').innerHTML) - parseInt(document.getElementById('poistomaara').value);
                                document.getElementById('poistomaara').value = ""; // tyhjentää määrän tekstilaatikon
                                document.getElementById('kayttaja').value = ""; // tyhjentää käyttäjän tekstilaatikon
                                poistaminen.dialog("close"); // sulkee ikkunan
                                $('#ToastPoisto').toast('show');
                            },
                            error: function(data){
                                alert("Jotain meni väärin: " + data.status); // ilmoittaa jos jotain meni väärin
                            }
                        })
                    }
                },
            },
            {
                text: "Keskeytä",
                class: "btn btn-outline-secondary",
                click: function(){
                    document.getElementById('poistomaara').value = ""; // tyhjentää määrän tekstilaatikon
                    document.getElementById('kayttaja').value = ""; // tyhjentää käyttäjän tekstilaatikon
                    $(this).dialog("close");
                }
            }
        ]
    });
    $('#poistaminen').validate({ // Poistamisen tarkistus
        
        rules: {
            POISTOMAARA: {
                required: true, // määrä kenttä on pakollinen
                digits: true,   // vaan numerona   
                min: 1,         // minimimäärä on 1
                max: function() {
                    return parseInt(document.querySelector('#saldo').innerHTML); // maksimimäärä on nykyinen saldo
                }
            },
            KAYTTAJA:{
                required: true, // Käyttäjä on pakollinen
                maxlength: 45
            }
        },
        messages: { // virheviestit
            POISTOMAARA: {
                required: "'Määrä' kenttä on pakollinen",
                digits: "Vaan numerona",
                min: "Minimimäärä on 1",
                max: "Määrä ei voi olla isompi kun saldo"
            },
            KAYTTAJA:{
                required: "'Käyttäjä' kenttä on pakollinen",
                maxlength: "Liian pitkä nimi"
            }
        }
    });
     
});

function Haku() { // haku nimellä algoritmi
    var input, filter, table, tr, td, i, txtValue, radio, id;
    radio = document.getElementById("numero");
    input = document.getElementById("opnum");
    filter = input.value.toUpperCase();
    table = document.getElementById("tuotteet");
    tr = table.getElementsByTagName("tr");
    id = document.getElementById("id_type")

    if (radio.checked == true) {
        filter = input.value;
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }       
        }
    }
    else {
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }       
        }
    }
};

var hoverOrClick = function () {    // Hoverin aktivointi
    $('.description').html($(this).attr('description-data'));
    $('.description').fadeIn();     //Description-kenttä ilmestyy, kun hiiri päällä tai kosketus oli
};