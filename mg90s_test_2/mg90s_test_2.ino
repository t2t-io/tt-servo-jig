#include <Servo.h>

Servo servo_1; // servo controller (multiple can exist)
Servo servo_2; // servo controller (multiple can exist)

int servo1_pin = 9; // PWM pin for servo control
int servo2_pin = 10;
int pos = 0;    // servo starting position

#define S1A servo_1.attach(servo1_pin, 900, 2100);
#define S1D servo_1.detach();
#define S2A servo_2.attach(servo2_pin, 900, 2100);
#define S2D servo_2.detach();

int servo_delay = 300;

void setup() {
  Serial.begin(115200);
  S1A
  servo_1.writeMicroseconds(1500);
  delay(servo_delay);
  S1D

  S2A
  servo_2.writeMicroseconds(1500);
  delay(servo_delay);
  S2D
}
char srbuf[256];
int srptr = 0;

void loop() {
  if(Serial.available() > 0){
    int inb = Serial.read();
    if(inb == 0xa || inb == 0xd){
      srbuf[srptr] = 0x0;
      srptr = 0;
      Serial.println();
      Serial.print("Got packet: ");
      Serial.print(srbuf);
      Serial.println();
      
      if(srbuf[0] == 'm'){
        int mid, pos;
        sscanf( srbuf, "m%d, p%d", &mid, &pos);
        Serial.println(mid);
        Serial.println(pos);
        if(mid == 1){
          //servo_1.write(pos);
          S1A
          servo_1.writeMicroseconds(pos);
          delay(servo_delay);
          S1D
        }else if(mid == 2){
          S2A
          servo_2.writeMicroseconds(pos);
          delay(servo_delay);
          S2D
        }
      }else if(srbuf[0] == 'd'){
        sscanf(srbuf, "d%d", &servo_delay);
        Serial.print("servo_delay:");
        Serial.println(servo_delay);
      }
    }else{
      srbuf[srptr++] = inb;      
    }
  }
}
