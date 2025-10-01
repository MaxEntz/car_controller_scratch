#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Servo.h>

// Identifiants Wi-Fi
const char* ssid = "Habitant@KM0";
const char* password = "colloque2";
const char* mdnsName = "matteolecar";

//4 av droit
//0 arr droit
//12 arr gauche
//14 av gauche

// Définition des pins moteurs
#define PIN_MOTOR1 4 // D2 / GPIO4 //avant droit
#define PIN_MOTOR2 14 // D1 / GPIO5
#define PIN_MOTOR3 0
#define PIN_MOTOR4 12

Servo motor1;
Servo motor2;
Servo motor3;
Servo motor4;

ESP8266WebServer server(80);

// Fonctions de contrôle moteur
void handleMotor1() {
  String cmd = server.arg("cmd");
  if (cmd == "avant") motor1.write(0); // FS90R sens horaire
  else if (cmd == "arriere") motor1.write(180); // sens antihoraire
  else motor1.write(90); // stop
  server.send(200, "text/plain", "Moteur 1 : " + cmd);
}

void handleMotor2() {
  String cmd = server.arg("cmd");
  if (cmd == "avant") motor2.write(180);
  else if (cmd == "arriere") motor2.write(0);
  else motor2.write(90);
  server.send(200, "text/plain", "Moteur 2 : " + cmd);
}

void handleMotor3() {
  String cmd = server.arg("cmd");
  if (cmd == "avant") motor3.write(0);
  else if (cmd == "arriere") motor3.write(180);
  else motor3.write(90);
  server.send(200, "text/plain", "Moteur 3 : " + cmd);
}

void handleMotor4() {
  String cmd = server.arg("cmd");
  if (cmd == "avant") motor4.write(180);
  else if (cmd == "arriere") motor4.write(0);
  else motor4.write(90);
  server.send(200, "text/plain", "Moteur 4 : " + cmd);
}

// Fonction pour contrôler tous les moteurs ensemble
void handleDirection() {
  String dir = server.arg("dir");
  
  if (dir == "avant") {
    // Tous les moteurs en avant
    motor1.write(0);
    motor2.write(180);
    motor3.write(0);
    motor4.write(180);
  }
  else if (dir == "arriere") {
    // Tous les moteurs en arrière
    motor1.write(180);
    motor2.write(0);
    motor3.write(180);
    motor4.write(0);
  }
  else if (dir == "gauche") {
    // Tourner à gauche sur place: moteurs droits en avant, moteurs gauches en arrière
    motor1.write(0);    // avant droit -> avant
    motor3.write(0);   // arrière droit -> avant
    motor2.write(0);    // avant gauche -> arrière
    motor4.write(0);    // arrière gauche -> arrière
  }
  else if (dir == "droite") {
    // Tourner à droite sur place: moteurs gauches en avant, moteurs droits en arrière
    motor1.write(180);  // avant droit -> arrière
    motor3.write(180);  // arrière droit -> arrière
    motor2.write(180);  // avant gauche -> avant
    motor4.write(180);  // arrière gauche -> avant
  }
  else if (dir == "stop") {
    // Arrêter tous les moteurs
    motor1.write(90);
    motor2.write(90);
    motor3.write(90);
    motor4.write(90);
  }
  
  server.send(200, "text/plain", "Direction : " + dir);
}

void handleRoot() {
  String html = R"=====(
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <style>
        body { font-family: Arial; text-align: center; margin-top: 50px; }
        button {
          padding: 15px 30px;
          margin: 10px;
          font-size: 16px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
        }
        button:hover { background-color: #0056b3; }
        .info { color: #666; font-size: 14px; margin-top: 30px; }
        .link-btn {
          display: inline-block;
          padding: 20px 40px;
          margin: 20px;
          font-size: 18px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 10px;
        }
        .link-btn:hover { background-color: #218838; }
      </style>
    </head>
    <body>
      <h2>Contrôle des moteurs FS90R</h2>
      <a href="/control" class="link-btn">🎮 Mode Contrôle Directionnel</a>
      <h3>Moteur 1</h3>
      <button onclick="sendCmd('/moteur1?cmd=avant')">Avant</button>
      <button onclick="sendCmd('/moteur1?cmd=stop')">Stop</button>
      <button onclick="sendCmd('/moteur1?cmd=arriere')">Arrière</button>
      <h3>Moteur 2</h3>
      <button onclick="sendCmd('/moteur2?cmd=avant')">Avant</button>
      <button onclick="sendCmd('/moteur2?cmd=stop')">Stop</button>
      <button onclick="sendCmd('/moteur2?cmd=arriere')">Arrière</button>
      <h3>Moteur 3</h3>
      <button onclick="sendCmd('/moteur3?cmd=avant')">Avant</button>
      <button onclick="sendCmd('/moteur3?cmd=stop')">Stop</button>
      <button onclick="sendCmd('/moteur3?cmd=arriere')">Arrière</button>
      <h3>Moteur 4</h3>
      <button onclick="sendCmd('/moteur4?cmd=avant')">Avant</button>
      <button onclick="sendCmd('/moteur4?cmd=stop')">Stop</button>
      <button onclick="sendCmd('/moteur4?cmd=arriere')">Arrière</button>
      <div class='info'>
        <p>Accessible via: http://robot.local</p>
      </div>
      <script>
        function sendCmd(url) {
          fetch(url).then(response => response.text()).then(console.log);
        }
      </script>
    </body>
    </html>
  )=====";
  server.send(200, "text/html", html);
}

void handleControl() {
  String html = R"=====(
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <style>
        body {
          font-family: Arial;
          text-align: center;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        h2 {
          color: white;
          margin-bottom: 30px;
        }
        .control-container {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .direction-pad {
          display: grid;
          grid-template-columns: 80px 80px 80px;
          grid-template-rows: 80px 80px 80px;
          gap: 10px;
          margin: 20px auto;
          width: fit-content;
        }
        .dir-btn {
          width: 80px;
          height: 80px;
          border: none;
          border-radius: 15px;
          font-size: 30px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .dir-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .dir-btn:hover {
          background: white;
        }
        .stop-btn {
          background: #ff4757 !important;
          color: white;
          font-size: 20px;
          font-weight: bold;
        }
        .stop-btn:hover {
          background: #ff3838 !important;
        }
        #up { grid-column: 2; grid-row: 1; }
        #left { grid-column: 1; grid-row: 2; }
        #stop { grid-column: 2; grid-row: 2; }
        #right { grid-column: 3; grid-row: 2; }
        #down { grid-column: 2; grid-row: 3; }
        .back-link {
          display: inline-block;
          margin-top: 30px;
          padding: 15px 30px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-size: 16px;
        }
        .back-link:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .status {
          color: white;
          margin-top: 20px;
          font-size: 18px;
          min-height: 30px;
        }
      </style>
    </head>
    <body>
      <h2>🎮 Contrôle Directionnel</h2>
      <div class='control-container'>
        <div class='direction-pad'>
          <button id='up' class='dir-btn' onmousedown="move('avant')" onmouseup="stop()" ontouchstart="move('avant')" ontouchend="stop()">⬆️</button>
          <button id='left' class='dir-btn' onmousedown="move('gauche')" onmouseup="stop()" ontouchstart="move('gauche')" ontouchend="stop()">⬅️</button>
          <button id='stop' class='dir-btn stop-btn' onclick="stop()">STOP</button>
          <button id='right' class='dir-btn' onmousedown="move('droite')" onmouseup="stop()" ontouchstart="move('droite')" ontouchend="stop()">➡️</button>
          <button id='down' class='dir-btn' onmousedown="move('arriere')" onmouseup="stop()" ontouchstart="move('arriere')" ontouchend="stop()">⬇️</button>
        </div>
        <div class='status' id='status'>Prêt</div>
      </div>
      <a href='/' class='back-link'>← Retour au menu principal</a>
      <script>
        function move(direction) {
          fetch('/direction?dir=' + direction)
            .then(response => response.text())
            .then(data => {
              document.getElementById('status').textContent = data;
            });
        }
        function stop() {
          fetch('/direction?dir=stop')
            .then(response => response.text())
            .then(data => {
              document.getElementById('status').textContent = 'Arrêté';
            });
        }
        // Support clavier
        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowUp') move('avant');
          else if (e.key === 'ArrowDown') move('arriere');
          else if (e.key === 'ArrowLeft') move('gauche');
          else if (e.key === 'ArrowRight') move('droite');
          else if (e.key === ' ') stop();
        });
        document.addEventListener('keyup', function(e) {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            stop();
          }
        });
      </script>
    </body>
    </html>
  )=====";
  server.send(200, "text/html", html);
}

void setup() {
  delay(2000);
  Serial.begin(115200);
  
  motor1.attach(PIN_MOTOR1);
  motor2.attach(PIN_MOTOR2);
  motor3.attach(PIN_MOTOR3);
  motor4.attach(PIN_MOTOR4);
  motor1.write(90); // Stop
  motor2.write(90);
  motor3.write(90);
  motor4.write(90);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connexion WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nConnecté !");
  Serial.print("IP locale : ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin(mdnsName)) {
    Serial.println("mDNS démarré avec succès !");
    Serial.print("Accès via : http://");
    Serial.print("matteolecar");
    Serial.println(".local");
  } else {
    Serial.println("Erreur démarrage mDNS !");
  }
  MDNS.addService("http", "tcp", 80);
  
  server.on("/", handleRoot);
  server.on("/control", handleControl);
  server.on("/direction", handleDirection);
  server.on("/moteur1", handleMotor1);
  server.on("/moteur2", handleMotor2);
  server.on("/moteur3", handleMotor3);
  server.on("/moteur4", handleMotor4);
  server.begin();
  
  Serial.println("Serveur démarré");
}

void loop() {
  MDNS.update();
  
  server.handleClient();
}