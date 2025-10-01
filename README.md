# Car Controller Scratch

Control an ESP8266 with 4 servo motors using a Scratch-like IDE.

## Project Summary

This project provides firmware and tools to control a remote-controlled car using an ESP8266 microcontroller and up to four servo motors. The goal is to make robotics and programming accessible and fun by allowing you to program the car using a visual, Scratch-inspired interface. Whether you're a hobbyist, educator, or student, this project lets you build, customize, and interact with your car easily.

## Features

- Full control of 4 servo motors via ESP8266
- WiFi connectivity for remote control
- mDNS support for easy access
- Scratch-like visual programming IDE (desktop/web)
- Arduino-compatible firmware

---

## Getting Started

### 1. Requirements

- ESP8266 board (e.g., NodeMCU, Wemos D1 Mini)
- 4x servo motors
- Arduino IDE (latest version recommended)
- USB cable for programming

### 2. Arduino IDE Setup

1. **Install ESP8266 Board Package:**
   - Open Arduino IDE.
   - Go to `File > Preferences`.
   - In "Additional Boards Manager URLs", add:
     ```
     http://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   - Go to `Tools > Board > Boards Manager`.
   - Search for "ESP8266" and install it.

2. **Select Your Board:**
   - Go to `Tools > Board` and select your ESP8266 model (e.g., "NodeMCU 1.0 (ESP-12E Module)").
   - Double-check the COM port under `Tools > Port`.

3. **Install Required Libraries:**
   - Go to `Sketch > Include Library > Manage Libraries`.
   - Install the following libraries:
     - Servo ESP8266
     - ESP8266WiFi
     - ESP8266mDNS
     - (Others as needed – check code for `#include` statements)

### 3. Configure WiFi and mDNS

**Before uploading the code:**

- Open the main `.ino` file in Arduino IDE.
- Find these lines (usually at the top):

  ```cpp
  const char* ssid = "YOUR_WIFI_SSID";
  const char* password = "YOUR_WIFI_PASSWORD";
  const char* mdnsName = "carcontroller";
  ```

- Replace `"YOUR_WIFI_SSID"` and `"YOUR_WIFI_PASSWORD"` with your actual WiFi credentials.
- (Optional) Change `"carcontroller"` to your preferred mDNS name. Access your device at `http://carcontroller.local/` on the same network.

### 4. Upload the Firmware

- Click the **Upload** button in Arduino IDE.
- Wait for the upload to complete.
- Open the Serial Monitor to view connection status and debug messages.

### 5. Connect and Control

- Power your ESP8266 and servos (ensure adequate power supply).
- On your computer or mobile device, connect to the same WiFi network.
- Open a browser and go to `http://carcontroller.local/` (or the mDNS name you set).
- Use the Scratch-like interface to create programs and control your car.

---

## Tips & Notes

- **Board Selection:** Always double-check your board and port settings in Arduino IDE before uploading.
- **Libraries:** If you get compilation errors, ensure all required libraries are installed.
- **Power:** Servos can draw significant current. Use a separate power supply if needed.
- **mDNS:** Some devices may not support `.local` addresses natively; use the IP address if needed.
- **Customization:** You can expand the code for additional sensors, motor types, or features!

---

## Contributing

Pull requests and issues are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) if available.

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

**Have fun building and programming your car!**