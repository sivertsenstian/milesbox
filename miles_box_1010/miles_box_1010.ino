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
int BOX_ID = 1;

// Initialize the Wifi client library
WiFiSSLClient client;
Adafruit_Si7021 sensor = Adafruit_Si7021();

unsigned long lastConnectionTime = 0;            // last time you connected to the server, in milliseconds
const unsigned long postingInterval = 30L * 1000L; // delay between updates, in milliseconds

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

  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
}

void loop() {
  if (millis() - lastConnectionTime > postingInterval) {  
    long temperature = sensor.readTemperature();
    long humidity = sensor.readHumidity();

    // close any connection before send a new request.
    // This will free the socket on the Nina module
    client.stop();
    
    sendSensorData(BOX_ID, TEMPERATURE_SENSOR, temperature);
    sendSensorData(BOX_ID, HUMIDITY_SENSOR, humidity);

    // note the time that the connection was made:
    lastConnectionTime = millis();
  }
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
  
  delay(1000);
}
