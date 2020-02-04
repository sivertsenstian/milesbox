/*
  Miles Box sensor data
  @sivertsenstian
 */

#include <SPI.h>
#include <WiFi101.h>
#include "miles_box_secrets.h"
#include "Adafruit_Si7021.h"

/////// Please enter your sensitive data in the Secret miles_box_secrets.h
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

int status = WL_IDLE_STATUS;
char server[] = "rest.sivertsen.tech";
int TEMPERATURE_SENSOR = 1;
int HUMIDITY_SENSOR = 13;
int BOX_ID = 1000;
int DELAY_IN_MS = 30000;

WiFiClient client;
Adafruit_Si7021 sensor = Adafruit_Si7021();

void setup() {
  WiFi.setPins(8,7,4);
  
  if (WiFi.status() == WL_NO_SHIELD || !sensor.begin()) {
    // don't continue:
    while (true);
  }
}

void loop() {
  // Connect to WiFi
  connect();
  
  long temperature = sensor.readTemperature();
  long humidity = sensor.readHumidity();
  
  sendTemperature(temperature);
  sendHumidity(humidity);

  // Disconnect after sending data;
  client.stop();

  // wait a bit before next update
  delay(DELAY_IN_MS);
}

void sendTemperature(long temperature) {
  if (client.connectSSL(server, 443)) {
    String request = String("GET /boxes/" + String(BOX_ID) + "/sensors/" + String(TEMPERATURE_SENSOR) + "/add/" + String(temperature) + " HTTP/1.1");
    // Make a HTTP request:
    client.println(request);
    client.println("Host: " + String(server));
    client.println("Authorization: " + String(SECRET_API_KEY));
    client.println("Connection: close");
    client.println();
  }
}

void sendHumidity(long humidity) {
  if (client.connectSSL(server, 443)) {
    String request = String("GET /boxes/" + String(BOX_ID) + "/sensors/" + String(HUMIDITY_SENSOR) + "/add/" + String(humidity) + " HTTP/1.1");
    // Make a HTTP request:
    client.println(request);
    client.println("Host: " + String(server));
    client.println("Authorization: " + String(SECRET_API_KEY));
    client.println("Connection: close");
    client.println();
  }
}

void connect() {
  // attempt to connect to WiFi network:
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
} 
