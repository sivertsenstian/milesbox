/*
  Miles Box sensor data MKR WIFI1010
  @sivertsenstian
 */
#include <SPI.h>
#include <WiFiNINA.h>
#include "miles_box_secrets.h" 
#include "Adafruit_Si7021.h"
///////please enter your sensitive data in the Secret miles_box_secrets.h
char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;            // your network key Index number (needed only for WEP)

int status = WL_IDLE_STATUS;
char server[] = "rest.sivertsen.tech";
int TEMPERATURE_SENSOR = 1;
int HUMIDITY_SENSOR = 2;
int BOX_ID = 20;

// Initialize the Wifi client library
WiFiSSLClient client;
Adafruit_Si7021 sensor = Adafruit_Si7021();

void setup() {
  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    // don't continue
    while (true);
  }
  // check for the sensor module
  if (!sensor.begin()) {
    // don't continue
    while (true);
  }
}

void loop() {
  // connect to wifi if not connected
  connect();

  long temperature = sensor.readTemperature();
  long humidity = sensor.readHumidity();

  // send data
  sendSensorData(BOX_ID, TEMPERATURE_SENSOR, temperature);
  sendSensorData(BOX_ID, HUMIDITY_SENSOR, humidity);

  // Disconnect after sending data;
  client.stop();

  // wait a bit before next update
  delay(20000);
}

void sendSensorData(long boxId, long sensorId, long sensorValue) {
  // if there's a successful connection:
  if (client.connect(server, 443)) {
    String request = String("GET /boxes/" + String(boxId) + "/sensors/" + String(sensorId) + "/add/" + String(sensorValue) + " HTTP/1.1");
    client.println(request);
    client.println("Host: " + String(server));
    client.println("Authorization: " + String(SECRET_API_KEY));
    client.println("User-Agent: ArduinoWiFi/1.1");
    client.println("Connection: close");
    client.println();
  } 
  
  delay(5000);
}

void connect() {
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
}
