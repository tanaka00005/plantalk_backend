#include <WiFi.h>
#include <WebSocketsServer.h>
#include <DHT.h>

#define DHTPIN D0 
#define SoilPIN A1
#define BlightPIN A2
#define DHTTYPE DHT11  
const char* ssid = "SSID";
const char* password = "password";

DHT dht(DHTPIN, DHTTYPE);
WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
  Serial.begin(115200);

  Serial.println("Connect Start!");
  pinMode(0,INPUT);
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting...");
  }
  Serial.println("Connected to WiFi");
  Serial.printf("IP Address  : ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  Serial.println("WebSocket server started");
  webSocket.onEvent([](uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    if (type == WStype_CONNECTED) {
      Serial.println("Client Connected");
    }else if(type == WStype_DISCONNECTED){
      Serial.println("Client Disconnected");
    }
  });
}

void loop() {
  int soilValue = analogRead(SoilPIN);
  float soilpercent = 100.0 - ((soilValue - 1810.0) / 1540.0) * 100.0;
  int blightValue = analogRead(BlightPIN);
  float blightpercent = (blightValue / 4095.0) * 100.0;
  if (soilpercent < 0.0){
    soilpercent = 0.0;
  } else if (soilpercent > 100.0){
    soilpercent = 100.0;
  }
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true);
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  float hi = dht.computeHeatIndex(f, h);

  // float sensorValue = analogRead(0) * (3.3 / 4095.0);
  String DHTmessage = "湿度: "+String(h)+"%  "+"温度: "+String(t)+"℃";
  String Soilmessage = "水分量: "+String(soilpercent)+"%";
  String Blightmessage = "光量: "+String(blightpercent)+"%";
  webSocket.broadcastTXT(DHTmessage);
  webSocket.broadcastTXT(Soilmessage);
  webSocket.broadcastTXT(Blightmessage);
  webSocket.loop();
  delay(1000);
}
