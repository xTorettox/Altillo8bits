<?php
?>
<html>
<meta charset="UTF-8">

<head>
    <title>El Altillo 8-Bits</title>
    <!-- styles -->
    <link rel="shortcut icon" href="img/favico.ico">
    <link rel="stylesheet" type="text/css" href="./estilo/estilo.css">
    <link rel="stylesheet" type="text/css" href="./estilo/nes.css">
    <link rel="stylesheet" type="text/css" href="./estilo/animate.css">

    <!-- meta tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="NES.css">
    <meta property="og:url" content="https://bcrikko.github.io/NES.css/">
    <meta property="og:description" content="NES-style CSS">
    <meta property="og:image" content="">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@bc_rikko">
    <meta name="twitter:creator" content="@bc_rikko">
    <meta name="twitter:image"
        content="https://user-images.githubusercontent.com/5305599/45937791-a5db2100-bffe-11e8-8bfd-fc3f534b28aa.gif">

    <!-- emulator script -->
    <script>
    var NepPlayer = "#emulator";
    // ID of html element where emulator will be inserted

    var NepEmu = "nes";
    // Platform select

    var NepLang = "en";
    // Option "en,rus,ptBR,ja"
    // Interface language of emulator. EN by default

    var NepMaxWidth = "500px";

    var gameUrl = "roms/64-in-1.nes"; // Game Url
    </script>

    <script src="https://mem.neptunjs.com/njs/njsLoader.js" type="text/javascript"></script>

    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-41640153-4"></script>

    <script>
    window.dataLayer = window.dataLayer || [];

    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'UA-41640153-4');
    </script>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>

	<!-- my scripts -->
	<script src="script/script.js"></script>

</head>

<body class="day">
    <!-- social media icons -->
    <div id="iconos">
        <a href="#"><i class="icon -medium -twitter" style="float: inherit; margin-bottom: 5px;"></i></a><br>
        <a href="#"><i class="icon -medium -facebook" style="float: inherit; margin-bottom: 5px;"></i></a><br>
        <a href="#"><i class="icon -medium -youtube" style="float: inherit; margin-bottom: 5px;"></i></a><br>
    </div>

    <div id="contenedor">

        <div id="cabecera" class="cabeceraOn" style="border-radius: 5px;">
            <div id="imgCabecera" style="background-color: rgba(0, 0, 0, 1);">
                <a href="#" onclick="irBienvenida()"><img class="imagenSaturada" src="img/CoinBox LogoPix.png"
                        style="float: left;height: auto; width: auto; max-height: 120;"></a>
                <a href="#" onclick="irBienvenida()"><img id="logo" class="imagenSaturada" src="img/Altillo-8-Bits.png"
                        align="left" style="float: left; height: auto; width: auto; max-height: 120;"></a>
            </div>
            <div id="globos" style="float: right;">
                <img id="globoLuz" class="latido" src="img/GloboLuz.png" align="left"
                    style="float: right; height: auto; width: auto; max-height: 120; display: flex;">
                <img id="globoOsc" class="latido" src="img/GloboOsc.png" align="left"
                    style="float: right; height: auto; width: auto; max-height: 120; display: none;">
            </div>
        </div>

        <div id="menu" class="menuOn">
            <nav>
                <ul>
                    <li><a href="#" class="button -warning" style="float: left; width: 11em; text-align: center;"
                            onclick="irEmulador()">Jugar!</a>
                        <ul>
                            <li><a href="#" class="button -primary"
                                    style="float: left; width: 11em; text-align: center;" onclick="irRoms()">Elegir
                                    ROM</a></li>
                            <li><a href="#" class="button -primary"
                                    style="float: left; width: 11em; text-align: center;"
                                    onclick="irEmulador()">Aleatorio</a></li>
                            <li><a href="#" class="button -primary"
                                    style="float: left; width: 11em; text-align: center;">Ayuda</a></li>
                        </ul>
                    </li>
                    <li><a href="#" class="button -warning" style="float: left; width: 11em; text-align: center;"
                            onclick="irContacto()">Contacto</a></li>
                    <li><a href="#" class="button -warning" style="float: left; width: 11em; text-align: center;"
                            onclick="irBienvenida()">Acerca de</a></li>
                </ul>
            </nav>
            <a id="llaveon" href="#"
                style="float: right; width: auto; height: auto; max-height:45px; max-width:45px; display: flex;"
                onclick="cambiarLuz()"><img alt="Apagar la luz!" src="img/LlaveOn.png"></a>

            <a id="llaveoff" href="#"
                style="float: right; width: auto; height: auto; max-height:45px; max-width:45px; display: none;"
                onclick="cambiarLuz()"><img alt="Apagar la luz!" src="img/LlaveOff.png"></a>
            <a href="#" class="button -success" style="float: right; width: 7.5em; text-align: center;"
                onclick="irMapa()">Mapa</a>
        </div>

        <div id="cuerpo">
            <div id="seccionBienvenida" style="display: none; margin:15px; padding: 15px; padding-top: 25;">
                <div id="textoBienvenida" style="width: 65%; float: left; padding-left: 25px;">
                    <h3 class="title -is-4">Por que "El Altillo"?</h3>
                    <br>
                    <img class="imagenSaturadaMax" src="img/Retro Coin.png"
                        style="float:left; width: 25px; height: 25px; margin-right: 5px;"></img>
                    <p style="color: white;">Todos aquellos de nosotros que nacimos alla por los 80's, en el auge de las
                        peliculas de ciencia ficcion
                        de hollywood, absorbimos como esponjas toda la cultura yanki de la epoca: extraterrestres,
                        viajes en el tiempo, monstruos,
                        radiograbadores al hombro y mucho rock and roll, dibujitos japoneses, las primeras computadoras,
                        las maquinas arcade.
                    </p>
                    <img class="imagenSaturadaMax" src="img/Retro Coin.png"
                        style="float:left; width: 25px; height: 25px; margin-right: 5px;"></img>
                    <p style="color: white;">Una no tan breve subcultura adolescente, quizas los mas retraidos,
                        probablemente los mas acosados,
                        se recluian a disfrutar de todas estas influencias. La musica, la fantasia y la tecnologia
                        comenzaban a abrirse paso incluso
                        en nuestras tierras de campo, mate y bicicletas, y era preciso un lugar donde reunir todas estas
                        disciplinas, a escondidas
                        del mundo, los camorreros y los viejos.
                    </p>
                    <img class="imagenSaturadaMax" src="img/Retro Coin.png"
                        style="float:left; width: 25px; height: 25px; margin-right: 5px;"></img>
                    <p style="color: white;">Los adolescentes estadounidenses tenian la suerte de tener siempre en la
                        infraestructura de sus hogares
                        un sotano, un desvan, o un altillo. Esos escondrijos, esas habitaciones faltas de luz (pero
                        compensantes en privacidad), eran la
                        primera opcion al momento de seleccionar un cuartel. En honor a estos verdaderos santuarios, y
                        quizas llevado por la nostalgia,
                        desarrolle esta modesta guarida, para que todos los que quieran venir a compartir una aventura,
                        a la vieja usanza, puedan sumarse.
                    </p>
                </div>
                <div id="imagenesBienvenida" class="container with-title"
                    style="width: 35%; float:right; overflow:visible; padding: 7px">
                    <div style=" float:right; overflow: hidden;">
                        <img class="imagenZoom" src="img/PacMan_Arc.png"></img>
                    </div>

                </div>
            </div>

            <div id="seccionContacto"
                style="display: none; margin:15px; padding: 15px; padding-top: 25; position: inherit;">
                <div id="formularioContacto" style="width:50%; float: left; margin-left: 5px;">
                    <h3 class="title -is-4">Contactanos!</h3>
                    <div class="field">
                        <label class="label" style="position: inherit;">Nombre</label>
                        <input class="input" type="text" placeholder="como te llamas...?" style="position: inherit;">
                        <label class="label" style="padding-top: 5px;">Correo Electronico</label>
                        <input class="input" type="text" placeholder="me dejas tu correo?">
                        <label class="label" style="padding-top: 5px;">Mensaje</label>
                        <textarea class="input" cols="55" placeholder="aca dejame tu mensaje!!"></textarea>
                        <a href="#" class="button -primary" style="float: right; width: 7.5em; text-align: center;"
                            onclick="alert('Mensaje enviado!')">Enviar</a>
                    </div>
                </div>


                <div id="globitos" style="width:50%; float: right; margin-left: 15px;">
                    <div class="conversation">
                        <div class="balloon -left" style="color: white;">
                            <p>Hola che! Quiero comentar</p>
                        </div>
                        <div class="avatar -left">
                            <img src="img/HongoRSml.PNG" width="50" height="50">
                        </div>
                    </div>
                    <div class="conversation" style="margin-top: 10px;">
                        <div class="balloon -right" style="float: left; color: white;">
                            <p>Hola! Claro, deja tu mensaje por aca! Sera bienvenido...</p>
                        </div>
                        <div class="avatar -right">
                            <img src="img/Flor.PNG" width="50" height="50" style="float: right;">
                        </div>
                    </div>
                </div>

            </div>

            <div id="seccionEmulador" style="display: flex; padding-left: 15px; padding-top: 5;">
                <div id="instrucciones" style="width:335px; padding-top: 50px;">
                    <img class="imagenSaturada" src="img/ControlNes.png">
                </div>
                <div id="emulator">
                    <!--<br>-->
                    <!--<a href="http://www.adobe.com/go/getflashplayer">-->
                    <!--	<img class="bounceIn" src="img/FlashPlayer.png" alt="Descargar Adobe Flash player" />-->
                    <!--</a>-->

                </div>
                <div id="instrucciones2" style="padding-top: 50px; width: 25%; float: right; padding-left: 25px;">
                    <img class="imagenZoom" src="img/Batalla_8b.png"
                        style="width: 100%; height: auto; float: right; filter: saturate(135%); transition:all .5s ease-in-out;">
                </div>
            </div>

            <div id="seccionRoms"
                style="display: none; margin:15px; padding: 15px; padding-top: 25; padding-left: 15px;">
                <div id="bannerRecomendados" style="float: left; width: 47%; padding-right: 15px;">
                    <h2 class="title -is-4" style="float: right;">Recomendados de la Semana</h2>
                    <div id="contenidoBanner" style="padding-left: 95px;">
                        <p style="color: #fff; padding-top: 20px;" align="justify">Tiny Toons Adventure</p>
                        <img class="imagenEscalaGris" src="img/TinyToons.png" width="250" style="padding-left: 55px;">
                        <p style="color: #fff; padding-top: 20px;" align="justify">Operation Wolf</p>
                        <img class="imagenEscalaGris" src="img/OperationWolf.png" width="250"
                            style="padding-left: 55px;">
                        <p style="color: #fff; padding-top: 20px;" align="justify">California Games</p>
                        <img class="imagenEscalaGris" src="img/CalGames.jpg" width="250" style="padding-left: 55px;">
                    </div>
                </div>

                <div id="listaRoms" style=" float: right; width: 47%; padding-left: 15px;">
                    <h3 class="title -is-4">Elegi tu Juego!</h3>
                    <input class="input" type="text" placeholder="Buscar un juego" style="position: inherit;">
                    <a href="#" class="button -primary"
                        style="float: inherit; width: 7.6em; text-align: center;">Buscar!</a>

                    <?php
					echo ('<div id="cargaRoms" style="padding-top: 10px;">');
					$directorio = 'roms';
					$setArchivos  = scandir($directorio);
					$archivosNes = array();

					foreach ($setArchivos as $archivo) {
						$extension = pathinfo($archivo, PATHINFO_EXTENSION);
						if (strtolower($extension) == "nes") {
							array_push($archivosNes, $archivo);
						}
					}
					echo ('<div class="radios" ><div class="radios -columns">');
					$unavez  = true;
					foreach ($archivosNes as $rom) {
						echo ('<label><input class="radio" type="radio" style="position: inherit; color: white;" name="romElegido"');
						if ($unavez) {
							echo (' checked ');
							$unavez = false;
						}
						echo ('><p style="color: white;">' . $rom . '</p></label>');
					}
					echo ('</div></div>');

					?>
                </div>
                <a href="#" class="button -primary" style="float: right; width: 7.5em; text-align: center;"
                    onclick="irEmulador()">Jugar!</a>
            </div>
        </div>

        <div id="seccionAyuda" style="display: none; margin:15px; padding: 15px; padding-top: 25;">
        </div>

        <div id="seccionAcercaDe" style="display: none; margin:15px; padding: 15px; padding-top: 25;">
            <p align="center" style="color: #fff;">
                Este sitio aun esta en construccion! Mientras tanto, se puede acceder a este informe:
            </p>
            <p align="center" style="color: #fff;">
                <a href="informe/Informe_de_Sitio-Altillo_8-Bits.pdf" align="center">Ver informe</a>
            </p>
        </div>

        <div id="seccionMapa" style="display: none; margin:15px; padding: 15px; padding-top: 25;">
            <ul>
                <li>
                    <h3 class="title -is-4">Mapa del Sitio</h3>
                </li>
                <li style="padding-top: 25px; color: #ffcd00;"><a href="#" style="color: #fff;"
                        onclick="irBienvenida()">> Pagina Principal:</a> pagina de bienvenida del sitio</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff;" onclick="irEmulador()">>
                        Jugar!:</a> nos lleva directo al emulador de NES</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff; padding-left: 45px;"
                        onclick="irRoms()">> Elegir ROM:</a> nos permite elegir un juego del listado</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff; padding-left: 45px;"
                        onclick="irEmulador()">> Aleatorio:</a> elige un juego de forma aleatoria</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff; padding-left: 45px;"
                        onclick="irBienvenida()">> Ayuda:</a> nos explica como utilizar el emulador</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff;" onclick="irContacto()">>
                        Contacto:</a> siguiendo este enlace podemos dejar un mensaje en el sitio</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff;"
                        onclick="irBienvenida()">> Acerca de:</a> un breve detalle del sitio</li>
                <li style="padding-top: 7px; color: #ffcd00;"><a href="#" style="color: #fff;" onclick="irMapa()">>
                        Mapa:</a> un panorama del sitio, mas comodo que una brujula ;)</li>
            </ul>
        </div>

    </div>

    <div id="pie" class="pieOn">
        <p align="center" style="color: #aaaaaa; padding-right: 7px; padding-top: 2px;"> Trabajo Practico Final -
            DisGraf 2018 - TUDAW - UnComa
        </p>
    </div>
    </div>
</body>

</html>