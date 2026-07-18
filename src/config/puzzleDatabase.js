export const PUZZLE_DATABASE = {
  1: [
    {
      id: 'g1_p1',
      title: "1. The First Spark",
      instructions: "MISSION: The LED needs power! Snap the 'ON' state into the block to turn on the light.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"turn_led","id":"1","x":50,"y":50,"fields":{"PIN":"13","STATE":"LOW"}}]}}
    },
    {
      id: 'g1_p2',
      title: "1. Pitch Black",
      instructions: "MISSION: Turn the LED OFF, we need darkness. Snap the 'OFF' state into the block to turn the light OFF.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"turn_led","id":"1","x":50,"y":50,"fields":{"PIN":"13","STATE":"HIGH"}}]}}
    },
  ],
  2: [
    {
      id: 'g2_p1',
      title: "1. Blinker",
      instructions: "MISSION: Make the LED wait for 1 second before turning off. Add a Delay block between the two LED blocks and one Delay block at the end of all blocks!",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"turn_led","id":"1","x":50,"y":50,"fields":{"PIN":"13","STATE":"HIGH"},"next":{"block":{"type":"turn_led","id":"2","fields":{"PIN":"13","STATE":"LOW"}}}}]}}
    },
    {
      id: 'g2_p2',
      title : "2. Police Siren",
      instructions: "MISSION: Play a tone at 1000Hz for 2 seconds.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"play_tone","id":"Rn*zSk}Pn+~w_H:aO43)","x":90,"y":150,"fields":{"PIN":"12"},"inputs":{"FREQ":{"shadow":{"type":"math_number","id":"78#..vRFp})A8hE5,%/W","fields":{"NUM":440}}},"DURATION":{"shadow":{"type":"math_number","id":"KR$$OHpKhxzjHxfZ-N|1","fields":{"NUM":500}}}}}]}}
    },
  ],
  3: [
    {
      id: 'g3_p1',
      title: "1. Repeat Me",
      instructions: "MISSION: Use a 'Repeat 10 Times' block to make the LED blink 10 times without adding 20 separate blocks to the PLAYGROUND!",
      initialBlocks: {}
    },
    {
      id: 'g3_p2',
      title: "2. Infinite Alarm",
      instructions: "MISSION: Use a 'While' loop block to make the Siren sound repeat forever...",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"controls_whileUntil","id":"fuKY@6rPPHxhWa0,SReN","x":-90,"y":90,"fields":{"MODE":"WHILE"},"inputs":{"BOOL":{"block":{"type":"logic_boolean","id":"~iDa}?gCT2{_0KA+n*$`","fields":{"BOOL":"TRUE"}}}}}]}}
    }
  ],
  4: [
    {
      id: 'g4_p1',
      title: "1. Logic Gates",
      instructions: "MISSION: Use the IF block. If the Analog reading is greater than 500, turn the LED on.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"controls_if","id":"1","x":50,"y":50}]}}
    },
    {
      id: 'g4_p2',
      title: "2. Motion Detector",
      instructions: "MISSION: Use an IF block. IF theh PIR Motion Sensor reads HIGH, turn the LED 'ON'.",
      initialBlocks: {}
    },
    {
      id: 'g4_p3',
      title: "3. Night Light",
      instructions: "MISSION: Read the Analog Pin. IF the light level is LESS than 300, turn the LED 'ON'.",
      initialBlocks:{}
    }
  ],
  5: [
    {
      id: 'g5_p1',
      title: "1. Half Power(Implementing PWM Pins)",
      instructions: "MISSION: Digital is just ON or OFF. Use the 'Set PWM Pin' block to turn the LED on at exactly half its power(i.e. 127).",
      initialBlocks: {}
    },
    {
      id: 'g5_p2',
      title: "2. Servo Sweeper",
      instructions: "Set the Servo Motor to 0 degrees, wait 1 second, then set it to 180 degrees.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"servo_write","id":"t_ANQ8BJT.:iUz|gb88V","x":-50,"y":70,"fields":{"PIN":"11"},"inputs":{"ANGLE":{"shadow":{"type":"math_number","id":"(Iz/u-m,|fN6z+4Z(t[Y","fields":{"NUM":90}}}},"next":{"block":{"type":"servo_write","id":"+}5uplXH`DdEyE8)/N)h","fields":{"PIN":"11"},"inputs":{"ANGLE":{"shadow":{"type":"math_number","id":"VE)=QY9x?B%qE)7.@8B_","fields":{"NUM":90}}}}}}}]}}
    }
  ],
  6: [
    {
      id:'g6_p1',
      title: "1. Score Counter",
      instructions: "Create a VARIABLE called 'Score'. Every time the IR sensor detects an object, change the Score by 1 (add 1 to the previous value)!",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"controls_if","id":")lfYp,oF)au.0IZ#VC2h","x":70,"y":50,"inputs":{"IF0":{"block":{"type":"logic_compare","id":"s/2BEqh=UL?ZY#82TT59","fields":{"OP":"EQ"},"inputs":{"B":{"block":{"type":"math_number","id":"R7[^Xqns5ChJ+#X/lQ=$","fields":{"NUM":1}}}}}}}}]},"variables":[{"name":"Score","id":"u}z(6GC?)2$BngVcJ.AC"}]}
    },
    {
      id: 'g6_p2',
      title: "2. Distance Calculator",
      instructions: "Read the ULTRASONIC Sensor and save the Distance to a variable. Print that variable to the Serial Monitor.",
      initialBlocks: {"blocks":{"languageVersion":0,"blocks":[{"type":"read_ultrasonic","id":"v%0SY/#r+tKc(O}Wr/f@","x":-30,"y":150,"fields":{"TRIG":"11","ECHO":"12"}}]},"variables":[{"name":"Score","id":"u}z(6GC?)2$BngVcJ.AC"},{"name":"Distance","id":"-ldoJCdh!EF#0R~,e!yW"}]}
    }
  ],
  7: [
    {
      id: 'g7_p1',
      title: "1. Smart Thermostat",
      instructions: "Read the DHT11 Temperature. IF it is >30, turn Pin 9(Fan) ON, ELSE, turn it OFF.",
      initialBlocks: {}
    },
    {
      id: 'g7_p2',
      title: "2. NeoPixel Setup",
      instructions: "Initialize a NeoPixel strip with 5 LEDs. Set LED #1 to Red and LED #2 to Blue, then update the Strip!",
      initialBlocks:{}
    }
  ],
  8: [
    {
      id: 'g8_p1',
      title: "1. Secret Passcode",
      instructions: "Create an Array of size 4. Save the numbers 1,2,3,4 into the first four index slots.",
      initialBlocks:{}
    },
    {
      id: 'g8_p2',
      title: "2. Colour Palette",
      instructions: "Get the value from index 1 of your Array, and use it to set a NeoPixel's Brightness.",
      initialBlocks:{}
    }
  ],
  9: [
    {
      id: 'g9_p1',
      title: "1. DIY Code",
      instructions: "Move your blinking LED logic into a custom Void Function named 'blinkAlert'. Then, Call that function inside your loop{}.",
      initialBlocks: {}
    },
    {
      id: 'g9_p2',
      title: "2. The Return Value",
      instructions: "Create a Function returning an 'int' data that reads an Analog Sensor, divides it by 2, and returning the Final result.",
      initialBlocks:{}
    }
  ],
  10: [
    {
      id: 'g10_p1',
      title: "1. EMERGENCY Stop",
      instructions: "Don't use a normal IF block. Use a Hardware Interrupt block on Pin 2. When it goes FALLING, immediately STOP all motors.",
      initialBlocks: {}
    },
    {
      id: 'g10_p2',
      title: "2. Bluetooth Remote",
      instructions: "Initialize Bluetooth. IF you read the String 'FORWARD', make the servo turn to 180 degrees.",
      initialBlocks:{}
    }
  ]
};