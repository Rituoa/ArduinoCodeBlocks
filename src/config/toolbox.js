export const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category", "name": "Sprite Motion", "colour": "#5C81A6", 
      "contents": [
        { "kind": "block", "type": "sprite_move", "inputs": { "STEPS": { "shadow": { "type": "math_number", "fields": { "NUM": 20 } } } } },
        { "kind": "block", "type": "sprite_turn", "inputs": { "DEGREES": { "shadow": { "type": "math_number", "fields": { "NUM": 15 } } } } }
      ]
    },
    {
      "kind": "category", "name": "Basic", "colour": "#5CB1D6", 
      "contents": [
        { "kind": "block", "type": "turn_led" }, 
        { "kind": "block", "type": "pwm_write", "inputs": { "PWM": { "shadow": { "type": "math_number", "fields": { "NUM": 255 } } } } },
        { "kind": "block", "type": "serial_print", "inputs": { "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "Hello World!" } } } } },
        { "kind": "block", "type": "define_macro"},
      ]
    },
    {
      "kind": "category", "name": "Motion", "colour": "#4C97FF", 
      "contents": [
        { "kind": "block", "type": "servo_write", "inputs": { "ANGLE": { "shadow": { "type": "math_number", "fields": { "NUM": 90 } } } } }
      ]
    },
    {
      "kind": "category", "name": "Sensors", "colour": "#42CC8C", 
      "contents": [
        { "kind": "block", "type": "analog_read" },
        { "kind": "block", "type": "is_digital_pin"},
        { "kind": "block", "type": "read_dht" }, 
        { "kind": "block", "type": "read_ultrasonic" },
        { "kind": "block", "type": "read_ir"},
        { "kind": "block", "type": "read_pir"},
        { "kind": "block", "type": "read_float"}
      ]
    },
    {
      "kind": "category", "name": "Sound", "colour": "#FF5599", 
      "contents": [
        { "kind": "block", "type": "play_tone", "inputs": { "FREQ": { "shadow": { "type": "math_number", "fields": { "NUM": 440 } } }, "DURATION": { "shadow": { "type": "math_number", "fields": { "NUM": 500 } } } } },
        { "kind": "block", "type": "stop_tone" }
      ]
    },
    {
      "kind": "category", "name": "NeoPixel", "colour": "#9966FF", 
      "contents": [
        { "kind": "block", "type": "neopixel_init" },
        { "kind": "block", "type": "neopixel_set_color" },
        { "kind": "block", "type": "neopixel_show" }
      ]
    },
    {
      "kind": "category", "name": "Bluetooth", "colour": "#0055FF", 
      "contents": [
        { "kind": "block", "type": "bluetooth_init" }, 
        { "kind": "block", "type": "bluetooth_send", "inputs": { "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "Data" } } } } }, 
        { "kind": "block", "type": "bluetooth_read" }
      ]
    },
    {
      "kind": "category", "name": "Logic", "colour": "#FFAB19", 
      "contents": [
        { "kind": "block", "type": "controls_if" }, { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" }, { "kind": "block", "type": "logic_boolean" }
      ]
    },
    {
      "kind": "category", "name": "Math & Text", "colour": "#59C059", 
      "contents": [{ "kind": "block", "type": "math_number" }, { "kind": "block", "type": "math_arithmetic" }, { "kind": "block", "type": "text" } ]
    },
    {
      "kind": "category", "name": "Variables", "colour": "#FF8C1A", "custom": "VARIABLE"
    },
    {
      "kind": "category", "name": "Lists (Arrays)", "colour": "#F9703E", 
      "contents": [
        { "kind": "block", "type": "array_create" },
        { "kind": "block", "type": "array_set", "inputs": { "INDEX": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } }, "VALUE": { "shadow": { "type": "math_number", "fields": { "NUM": 100 } } } } },
        { "kind": "block", "type": "array_get", "inputs": { "INDEX": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } } } }
      ]
    },
    {
      "kind": "category", "name": "My Blocks", "colour": "#FF6680",
      "contents": [
        { "kind": "block", "type": "custom_cpp_function"},
        { "kind": "block", "type": "custom_return_statement", "inputs": {"VALUE": { "shadow": {"type": "math_number", "fields": {"NUM": 0}}}} },
        { "kind": "block", "type": "custom_cpp_call"},
        { "kind": "block", "type": "custom_cpp_call_return"}
      ]
    },
    {
      "kind": "category", "name": "Events", "colour": "#FFBF00", 
      "contents": [
        { "kind": "block", "type": "hardware_interrupt" }
      ]
    },
    {
      "kind": "category", "name": "Control", "colour": "#0fbd8c", 
      "contents": [
        { "kind": "block", "type": "controls_repeat_ext", "inputs": { "TIMES": { "shadow": { "type": "math_number", "fields": { "NUM": 10 } } } } },
        { "kind": "block", "type": "controls_whileUntil" },
        { "kind": "block", "type": "arduino_delay", "inputs": { "MS": { "shadow": { "type": "math_number", "fields": { "NUM": 1000 } } } } },
        { "kind": "block", "type": "arduino_millis"},
      ]
    }
  ]
};