// function to switch from dark to light mode (and viceversa)

function cambiarLuz() {

    var prender = document.getElementById("llaveoff");
    var apagar = document.getElementById("llaveon");
    var cuerpo = document.getElementsByTagName("BODY")[0];
    var menu = document.getElementById("menu");
    var cabeza = document.getElementById("cabecera");
    var logo = document.getElementById("logo");
    var globoLuz = document.getElementById("globoLuz");
    var globoOsc = document.getElementById("globoOsc");
    var pie = document.getElementById("pie");

    if (prender.style.display === "none") {
        prender.style.display = "flex";
        apagar.style.display = "none";
        globoOsc.style.display = "flex";
        globoLuz.style.display = "none";
        cuerpo.className = "night";
        menu.className = "menuOff";
        cabeza.className = "cabeceraOff";
        logo.src = "img/Altillo_Nite.png";
        pie.className = "pieOff";
    } else {
        prender.style.display = "none";
        apagar.style.display = "flex";
        cuerpo.className = "day";
        menu.className = "menuOn";
        cabeza.className = "cabeceraOn";
        globoOsc.style.display = "none";
        globoLuz.style.display = "flex";
        logo.src = "img/Altillo-8-Bits.png";
        pie.className = "pieOn";
    }
}

// page switchig functions

function irBienvenida() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "flex";
    contacto.style.display = "none";
    emulador.style.display = "none";
    roms.style.display = "none";
    ayuda.style.display = "none";
    acercaDe.style.display = "none";
    mapa.style.display = "none";
}

function irContacto() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "none";
    contacto.style.display = "flex";
    emulador.style.display = "none";
    roms.style.display = "none";
    ayuda.style.display = "none";
    acercaDe.style.display = "none";
    mapa.style.display = "none";
}


function irRoms() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "none";
    contacto.style.display = "none";
    emulador.style.display = "none";
    roms.style.display = "flex";
    ayuda.style.display = "none";
    acercaDe.style.display = "none";
    mapa.style.display = "none";
}

function irEmulador() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "none";
    contacto.style.display = "none";
    emulador.style.display = "flex";
    roms.style.display = "none";
    ayuda.style.display = "none";
    acercaDe.style.display = "none";
    mapa.style.display = "none";
}

function irMapa() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "none";
    contacto.style.display = "none";
    emulador.style.display = "none";
    roms.style.display = "none";
    ayuda.style.display = "none";
    acercaDe.style.display = "none";
    mapa.style.display = "flex";
}

function irAcercaDe() {
    var bienvenida = document.getElementById("seccionBienvenida");
    var contacto = document.getElementById("seccionContacto");
    var emulador = document.getElementById("seccionEmulador");
    var roms = document.getElementById("seccionRoms");
    var ayuda = document.getElementById("seccionAyuda");
    var acercaDe = document.getElementById("seccionAcercaDe");
    var mapa = document.getElementById("seccionMapa");

    bienvenida.style.display = "none";
    contacto.style.display = "none";
    emulador.style.display = "none";
    roms.style.display = "none";
    ayuda.style.display = "none";
    acercaDe.style.display = "flex";
    mapa.style.display = "none";
}