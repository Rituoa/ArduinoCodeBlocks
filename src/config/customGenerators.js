import { javascriptGenerator } from 'blockly/javascript';

export const defineCustomGenerators = () => {
  // INIT & FINISH OVERRIDES
  javascriptGenerator.init = function(workspace) {
    this.definitions_ = Object.create(null); 
    this.setups_ = Object.create(null);      
  };

  javascriptGenerator.finish = function(code) {
    return code; // Prevent default wrapping, we handle it in MainIDE
  };

  // GENERATORS
  javascriptGenerator.forBlock['turn_led'] = function(block) {
    const pin = block.getFieldValue('PIN');
    javascriptGenerator.arduinoSetup_[`setup_led_${pin}`] = `  pinMode(${pin}, OUTPUT);`;
    return `  digitalWrite(${pin}, ${block.getFieldValue('STATE')});\n`;
  };

  javascriptGenerator.forBlock['pwm_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const pwm = javascriptGenerator.valueToCode(block, 'PWM', javascriptGenerator.ORDER_ATOMIC) || '0';
    javascriptGenerator.arduinoSetup_[`setup_pwm_${pin}`] = `  pinMode(${pin}, OUTPUT);`;
    return `  analogWrite(${pin}, ${pwm});\n`;
  };

  javascriptGenerator.forBlock['analog_read'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`analogRead(${pin})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['arduino_delay'] = function(block) {
    const ms = javascriptGenerator.valueToCode(block, 'MS', javascriptGenerator.ORDER_ATOMIC) || '1000';
    return `  delay(${ms});\n`;
  };

  javascriptGenerator.forBlock['serial_print'] = function(block) {
    javascriptGenerator.arduinoSetup_['setup_serial'] = '  Serial.begin(9600);';
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || '""';
    return `  Serial.println(${text});\n`;
  };

  javascriptGenerator.forBlock['read_dht'] = function(block) {
    const pin = block.getFieldValue('PIN');
    javascriptGenerator.arduinoIncludes_['include_dht'] = '#include <DHT.h>';
    javascriptGenerator.arduinoGlobals_[`global_dht_${pin}`] = `DHT dht_${pin}(${pin}, DHT11);`;
    javascriptGenerator.arduinoSetup_[`setup_dht_${pin}`] = `  dht_${pin}.begin();`;
    return [`dht_${pin}.${block.getFieldValue('TYPE')}()`, javascriptGenerator.ORDER_ATOMIC]; 
  };

  javascriptGenerator.forBlock['read_ultrasonic'] = function(block) {
    const trig = block.getFieldValue('TRIG');
    const echo = block.getFieldValue('ECHO');
    javascriptGenerator.arduinoIncludes_['include_newping'] = '#include <NewPing.h>';
    javascriptGenerator.arduinoGlobals_[`global_sonar_${trig}_${echo}`] = `NewPing sonar_${trig}_${echo}(${trig}, ${echo}, 200);`;
    return [`sonar_${trig}_${echo}.ping_cm()`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['bluetooth_init'] = function(block) {
    javascriptGenerator.arduinoIncludes_['include_softwareserial'] = '#include <SoftwareSerial.h>';
    javascriptGenerator.arduinoGlobals_['global_bluetooth'] = `SoftwareSerial BTSerial(${block.getFieldValue('RX')}, ${block.getFieldValue('TX')});`;
    javascriptGenerator.arduinoSetup_['setup_bluetooth'] = '  BTSerial.begin(9600);';
    return ''; 
  };

  javascriptGenerator.forBlock['bluetooth_send'] = function(block) {
    return `  BTSerial.println(${javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || '""'});\n`;
  };

  javascriptGenerator.forBlock['bluetooth_read'] = function() {
    return ['BTSerial.readString()', javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['text'] = function(block) {
    const textValue = block.getFieldValue('TEXT');
    return [`"${textValue}"`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['variables_set'] = function(block) {
    const variable = block.workspace.getVariableById(block.getFieldValue('VAR'));
    const varName = variable.name.replace(/\s+/g, '_'); 
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ASSIGNMENT) || '0';
    javascriptGenerator.arduinoGlobals_[`var_${varName}`] = `float ${varName};`;
    return `  ${varName} = ${value};\n`;
  };

  javascriptGenerator.forBlock['variables_get'] = function(block) {
    const variable = block.workspace.getVariableById(block.getFieldValue('VAR'));
    const varName = variable.name.replace(/\s+/g, '_');
    return [varName, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['math_change'] = function(block) {
    const variable = block.workspace.getVariableById(block.getFieldValue('VAR'));
    const varName = variable.name.replace(/\s+/g, '_');
    const value = javascriptGenerator.valueToCode(block, 'DELTA', javascriptGenerator.ORDER_ADDITION) || '0';
    javascriptGenerator.arduinoGlobals_[`var_${varName}`] = `float ${varName};`;
    return `  ${varName} += ${value};\n`;
  };

  javascriptGenerator.forBlock['controls_repeat_ext'] = function(block) {
    const repeats = javascriptGenerator.valueToCode(block, 'TIMES', javascriptGenerator.ORDER_ASSIGNMENT) || '0';
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `  for (int count = 0; count < ${repeats}; count++) {\n${branch}  }\n`;
  };

  javascriptGenerator.forBlock['controls_whileUntil'] = function(block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    const argument0 = javascriptGenerator.valueToCode(block, 'BOOL', javascriptGenerator.ORDER_NONE) || 'false';
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    if (until) {
      return `  while (!(${argument0})) {\n${branch}  }\n`;
    } else {
      return `  while (${argument0}) {\n${branch}  }\n`;
    }
  };

  javascriptGenerator.forBlock['procedures_defnoreturn'] = function(block) {
    const funcName = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const branch = javascriptGenerator.statementToCode(block, 'STACK');
    const argsList = block.arguments_ || [];
    const args = argsList.map(arg => 'float ' + arg.replace(/\s+/g, '_'));
    const code = `void ${funcName}(${args.join(', ')}) {\n${branch}}\n`;
    javascriptGenerator.arduinoFunctions_[`func_${funcName}`] = code;
    return ""; 
  };

  javascriptGenerator.forBlock['procedures_callnoreturn'] = function(block) {
    const funcName = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const argsList = block.arguments_ || [];
    const args = argsList.map((arg, i) => javascriptGenerator.valueToCode(block, 'ARG' + i, javascriptGenerator.ORDER_NONE) || '0');
    return `  ${funcName}(${args.join(', ')});\n`;
  };

  javascriptGenerator.forBlock['procedures_defreturn'] = function(block) {
    const funcName = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const branch = javascriptGenerator.statementToCode(block, 'STACK');
    const returnValue = javascriptGenerator.valueToCode(block, 'RETURN', javascriptGenerator.ORDER_NONE) || '0';
    const argsList = block.arguments_ || [];
    const args = argsList.map(arg => 'float ' + arg.replace(/\s+/g, '_'));
    const code = `float ${funcName}(${args.join(', ')}) {\n${branch}  return ${returnValue};\n}\n`;
    javascriptGenerator.arduinoFunctions_[`func_${funcName}`] = code;
    return ""; 
  };

  javascriptGenerator.forBlock['procedures_callreturn'] = function(block) {
    const funcName = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const argsList = block.arguments_ || [];
    const args = argsList.map((arg, i) => javascriptGenerator.valueToCode(block, 'ARG' + i, javascriptGenerator.ORDER_NONE) || '0');
    return [`${funcName}(${args.join(', ')})`, javascriptGenerator.ORDER_ATOMIC]; 
  };

  javascriptGenerator.forBlock['procedures_ifreturn'] = function(block) {
    const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_NONE) || 'false';
    let code = `  if (${condition}) {\n`;
    if (block.hasReturnValue_) {
      const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_NONE) || '0';
      code += `    return ${value};\n`;
    } else {
      code += `    return;\n`;
    }
    code += `  }\n`;
    return code;
  };

  javascriptGenerator.forBlock['play_tone'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const freq = javascriptGenerator.valueToCode(block, 'FREQ', javascriptGenerator.ORDER_ATOMIC) || '440';
    const duration = javascriptGenerator.valueToCode(block, 'DURATION', javascriptGenerator.ORDER_ATOMIC) || '500';
    javascriptGenerator.arduinoSetup_[`setup_tone_${pin}`] = `  pinMode(${pin}, OUTPUT);`;
    return `  tone(${pin}, ${freq}, ${duration});\n`;
  };

  javascriptGenerator.forBlock['stop_tone'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return `  noTone(${pin});\n`;
  };

  javascriptGenerator.forBlock['arduino_millis'] = function(block) {
    return ['millis()', javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['neopixel_init'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const num = block.getFieldValue('NUM_LEDS');
    javascriptGenerator.arduinoIncludes_['include_neopixel'] = '#include <Adafruit_NeoPixel.h>';
    javascriptGenerator.arduinoGlobals_[`global_neopixel_${pin}`] = `Adafruit_NeoPixel strip_${pin}(${num}, ${pin}, NEO_GRB + NEO_KHZ800);`;
    javascriptGenerator.arduinoSetup_[`setup_neopixel_${pin}`] = `  strip_${pin}.begin();\n  strip_${pin}.show();`;
    return ''; 
  };

  javascriptGenerator.forBlock['neopixel_set_color'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const pixel = (parseInt(block.getFieldValue('PIXEL')) - 1) || 0; 
    const rgb = block.getFieldValue('COLOR'); 
    return `  strip_${pin}.setPixelColor(${pixel}, strip_${pin}.Color(${rgb}));\n`;
  };

  javascriptGenerator.forBlock['neopixel_show'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return `  strip_${pin}.show();\n`;
  };

  javascriptGenerator.forBlock['hardware_interrupt'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    const funcName = `isr_pin_${pin}`;
    javascriptGenerator.arduinoFunctions_[funcName] = `void ${funcName}() {\n${branch}}\n`;
    javascriptGenerator.arduinoSetup_[`setup_interrupt_pin_${pin}`] = `  pinMode(${pin}, INPUT_PULLUP);`;
    javascriptGenerator.arduinoSetup_[`attach_interrupt_${pin}`] = `  attachInterrupt(digitalPinToInterrupt(${pin}), ${funcName}, ${mode});`;
    return ''; 
  };

  javascriptGenerator.forBlock['array_create'] = function(block) {
    const name = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const size = block.getFieldValue('SIZE');
    javascriptGenerator.arduinoGlobals_[`array_${name}`] = `float ${name}[${size}];`;
    return ''; 
  };

  javascriptGenerator.forBlock['array_set'] = function(block) {
    const name = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC) || '0';
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC) || '0';
    return `  ${name}[${index}] = ${value};\n`;
  };

  javascriptGenerator.forBlock['array_get'] = function(block) {
    const name = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC) || '0';
    return [`${name}[${index}]`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['read_ir'] = function(block) {
    const pin = block.getFieldValue('PIN');
    javascriptGenerator.arduinoSetup_[`setup_input_${pin}`] = `  pinMode(${pin}, INPUT);`;
    return [`digitalRead(${pin})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['read_pir'] = function(block) {
    const pin = block.getFieldValue('PIN');
    javascriptGenerator.arduinoSetup_[`setup_input_${pin}`] = `  pinMode(${pin}, INPUT);`;
    return [`digitalRead(${pin})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['read_float'] = function(block) {
    const pin = block.getFieldValue('PIN');
    javascriptGenerator.arduinoSetup_[`setup_input_pullup_${pin}`] = `  pinMode(${pin}, INPUT_PULLUP);`;
    return [`digitalRead(${pin})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['servo_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const angle = javascriptGenerator.valueToCode(block, 'ANGLE', javascriptGenerator.ORDER_ATOMIC) || '90';
    javascriptGenerator.arduinoIncludes_['include_servo'] = '#include <Servo.h>';
    javascriptGenerator.arduinoGlobals_[`global_servo_${pin}`] = `Servo myServo_${pin};`;
    javascriptGenerator.arduinoSetup_[`setup_servo_${pin}`] = `  myServo_${pin}.attach(${pin});`;
    return `  myServo_${pin}.write(${angle});\n`;
  };

  javascriptGenerator.forBlock['custom_cpp_function'] = function(block) {
    const dataType = block.getFieldValue('DATA_TYPE');
    const funcName = block.getFieldValue('FUNC_NAME').replace(/\s+/g, '_');
    const body = javascriptGenerator.statementToCode(block, 'BODY');
    const params = block.params_ || [];
    const paramsString = params.map(p => `${p.type} ${p.name}`).join(', ');
    const code = `${dataType} ${funcName}(${paramsString}) {\n${body}}\n`;
    javascriptGenerator.arduinoFunctions_[`func_${funcName}`] = code;
    return "";
  };

  javascriptGenerator.forBlock['custom_cpp_call'] = function(block){
    const funcName = block.getFieldValue('FUNC_NAME').replace(/\s+/g, '_');
    const args = block.getFieldValue('ARGS'); 
    return `  ${funcName}(${args});\n`;
  };

  javascriptGenerator.forBlock['custom_cpp_call_return'] = function(block){
    const funcName = block.getFieldValue('FUNC_NAME').replace(/\s+/g, '_');
    const args = block.getFieldValue('ARGS');
    return [`${funcName}(${args})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['custom_return_statement'] = function(block) {
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
    if (!value) return "  return;\n";
    return `  return ${value};\n`;
  };

  javascriptGenerator.forBlock['define_macro'] = function(block){
    const name = block.getFieldValue('NAME').replace(/\s+/g, '_');
    const value = block.getFieldValue('VALUE');
    javascriptGenerator.arduinoGlobals_[`define_${name}`] = `#define ${name} ${value}`;
    return "";
  }

  javascriptGenerator.forBlock['is_digital_pin'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    javascriptGenerator.arduinoSetup_[`setup_pin_${pin}_input`] = `pinMode(${pin}, INPUT_PULLUP);`;
    const code = `(digitalRead(${pin}) == ${state})`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
};