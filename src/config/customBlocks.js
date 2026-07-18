import * as Blockly from 'blockly/core';

export const defineCustomBlocks = () => {
  Blockly.Blocks['turn_led'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Turn Digital Pin")
          .appendField(new Blockly.FieldDropdown([
            ["13", "13"], ["12", "12"], ["11", "11"], ["10", "10"], 
            ["9", "9"], ["8", "8"], ["7", "7"], ["6", "6"], 
            ["5", "5"], ["4", "4"], ["3", "3"], ["2", "2"]
          ]), "PIN")
          .appendField("to")
          .appendField(new Blockly.FieldDropdown([["ON", "HIGH"], ["OFF", "LOW"]]), "STATE");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#5CB1D6");             
    }
  };

  Blockly.Blocks['pwm_write'] = {
    init: function() {
      this.appendValueInput("PWM").setCheck("Number")
          .appendField("Set PWM Pin")
          .appendField(new Blockly.FieldDropdown([
            ["11", "11"], ["10", "10"], ["9", "9"], ["6", "6"], ["5", "5"], ["3", "3"] 
          ]), "PIN")
          .appendField("to Power (0-255)");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#5CB1D6");
    }
  };

  Blockly.Blocks['arduino_delay'] = {
    init: function() {
      this.appendValueInput("MS").setCheck("Number").appendField("Delay");
      this.appendDummyInput().appendField("milliseconds");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0fbd8c"); 
    }
  };

  Blockly.Blocks['serial_print'] = {
    init: function() {
      this.appendValueInput("TEXT").appendField("Serial Print");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#5CB1D6");
    }
  };

  Blockly.Blocks['analog_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read Analog Pin")
          .appendField(new Blockly.FieldDropdown([
            ["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]
          ]), "PIN");
      this.setOutput(true, "Number"); this.setColour("#42CC8C");
    }
  };

  Blockly.Blocks['read_dht'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read DHT11")
          .appendField(new Blockly.FieldDropdown([["Temperature", "readTemperature"], ["Humidity", "readHumidity"]]), "TYPE")
          .appendField("on Pin").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"]]), "PIN");
      this.setOutput(true, "Number"); this.setColour("#42CC8C");
    }
  };

  Blockly.Blocks['read_ultrasonic'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Ultrasonic Distance (cm)")
          .appendField("Trig").appendField(new Blockly.FieldTextInput("11"), "TRIG")
          .appendField("Echo").appendField(new Blockly.FieldTextInput("12"), "ECHO");
      this.setOutput(true, "Number"); this.setColour("#42CC8C"); 
    }
  };

  Blockly.Blocks['bluetooth_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Init Bluetooth")
          .appendField("RX").appendField(new Blockly.FieldTextInput("10"), "RX")
          .appendField("TX").appendField(new Blockly.FieldTextInput("11"), "TX");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0055FF"); 
    }
  };

  Blockly.Blocks['bluetooth_send'] = {
    init: function() {
      this.appendValueInput("TEXT").appendField("Bluetooth Send");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#0055FF");
    }
  };

  Blockly.Blocks['bluetooth_read'] = {
    init: function() {
      this.appendDummyInput().appendField("Bluetooth Read String");
      this.setOutput(true, "String"); this.setColour("#0055FF");
    }
  };

  Blockly.Blocks['play_tone'] = {
    init: function() {
      this.appendValueInput("FREQ").setCheck("Number")
          .appendField("Play tone on Pin")
          .appendField(new Blockly.FieldDropdown([
            ["12", "12"], ["11", "11"], ["10", "10"], ["9", "9"], ["8", "8"]
          ]), "PIN")
          .appendField("at Frequency (Hz)");
      this.appendValueInput("DURATION").setCheck("Number")
          .appendField("for Duration (ms)");
      this.setPreviousStatement(true, null); 
      this.setNextStatement(true, null); 
      this.setColour("#FF5599"); 
    }
  };

  Blockly.Blocks['stop_tone'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Stop tone on Pin")
          .appendField(new Blockly.FieldDropdown([
            ["12", "12"], ["11", "11"], ["10", "10"], ["9", "9"], ["8", "8"]
          ]), "PIN");
      this.setPreviousStatement(true, null); 
      this.setNextStatement(true, null); 
      this.setColour("#FF5599");
    }
  };

  Blockly.Blocks['arduino_millis'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("System Uptime (millis)");
      this.setOutput(true, "Number"); 
      this.setColour("#0fbd8c");      
    }
  };

  Blockly.Blocks['neopixel_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Init NeoPixel on Pin")
          .appendField(new Blockly.FieldDropdown([["6", "6"], ["5", "5"], ["4", "4"], ["3", "3"]]), "PIN")
          .appendField("with")
          .appendField(new Blockly.FieldTextInput("10"), "NUM_LEDS")
          .appendField("LEDs");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#9966FF"); 
    }
  };

  Blockly.Blocks['neopixel_set_color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set NeoPixel Pin")
          .appendField(new Blockly.FieldDropdown([["6", "6"], ["5", "5"], ["4", "4"], ["3", "3"]]), "PIN")
          .appendField("LED #")
          .appendField(new Blockly.FieldTextInput("1"), "PIXEL")
          .appendField("to Color")
          .appendField(new Blockly.FieldDropdown([
            ["🔴 Red", "255, 0, 0"], ["🟢 Green", "0, 255, 0"], ["🔵 Blue", "0, 0, 255"],
            ["🟡 Yellow", "255, 255, 0"], ["🟣 Purple", "128, 0, 128"],
            ["⚪ White", "255, 255, 255"], ["⚫ Off", "0, 0, 0"]
          ]), "COLOR"); 
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#9966FF");
    }
  };

  Blockly.Blocks['neopixel_show'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Update / Show NeoPixel Pin")
          .appendField(new Blockly.FieldDropdown([["6", "6"], ["5", "5"], ["4", "4"], ["3", "3"]]), "PIN");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#9966FF");
    }
  };

  Blockly.Blocks['hardware_interrupt'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("When Pin")
          .appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"]]), "PIN")
          .appendField("goes")
          .appendField(new Blockly.FieldDropdown([
            ["HIGH (Rising)", "RISING"], ["LOW (Falling)", "FALLING"], ["CHANGES", "CHANGE"]
          ]), "MODE");
      this.appendStatementInput("DO").setCheck(null);
      this.setColour("#FFBF00"); 
    }
  };

  Blockly.Blocks['array_create'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Create Array")
          .appendField(new Blockly.FieldTextInput("myList"), "NAME")
          .appendField("of size")
          .appendField(new Blockly.FieldNumber(10, 1), "SIZE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#F9703E"); 
    }
  };

  Blockly.Blocks['array_set'] = {
    init: function() {
      this.appendValueInput("INDEX").setCheck("Number")
          .appendField("Set Array")
          .appendField(new Blockly.FieldTextInput("myList"), "NAME")
          .appendField("at index");
      this.appendValueInput("VALUE").setCheck("Number").appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#F9703E");
    }
  };

  Blockly.Blocks['array_get'] = {
    init: function() {
      this.appendValueInput("INDEX").setCheck("Number")
          .appendField("Get Array")
          .appendField(new Blockly.FieldTextInput("myList"), "NAME")
          .appendField("at index");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour("#F9703E");
    }
  };

  Blockly.Blocks['read_ir'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read IR Obstacle Sensor on Pin")
          .appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["7", "7"], ["8", "8"], ["12", "12"]]), "PIN");
      this.setOutput(true, "Number");
      this.setColour("#42CC8C"); 
    }
  };

  Blockly.Blocks['read_pir'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read PIR Motion Sensor on Pin")
          .appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["7", "7"], ["8", "8"], ["12", "12"]]), "PIN");
      this.setOutput(true, "Number");
      this.setColour("#42CC8C"); 
    }
  };

  Blockly.Blocks['read_float'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read Water Float Switch on Pin")
          .appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["7", "7"], ["8", "8"], ["12", "12"]]), "PIN");
      this.setOutput(true, "Number");
      this.setColour("#42CC8C"); 
    }
  };

  Blockly.Blocks['servo_write'] = {
    init: function() {
      this.appendValueInput("ANGLE").setCheck("Number")
          .appendField("Set Servo on Pin")
          .appendField(new Blockly.FieldDropdown([["11", "11"], ["10", "10"], ["9", "9"], ["6", "6"], ["5", "5"], ["3", "3"]]), "PIN")
          .appendField("to Angle (0-180)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#4C97FF"); 
    }
  };

  Blockly.Blocks['custom_cpp_function'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Function returning")
          .appendField(new Blockly.FieldDropdown([
              ["void (No return)", "void"], ["int (Number)", "int"],
              ["float (Decimal)", "float"], ["boolean (True/False)", "bool"], ["String (Text)", "String"]
          ]), "DATA_TYPE")
          .appendField("named")
          .appendField(new Blockly.FieldTextInput("myRoutine"), "FUNC_NAME")
          .appendField(new Blockly.FieldImage(
            "https://cdn-icons-png.flaticon.com/512/126/126472.png", 16, 16, "Edit Parameters",
            function(field) {
              if (window.openFunctionEditor) window.openFunctionEditor(field.getSourceBlock());
            }
          ));
          
      this.appendStatementInput("BODY").setCheck(null);
      this.setColour("#FF6680"); 
      this.params_ = []; 
    },
    mutationToDom: function() {
      const container = Blockly.utils.xml.createElement('mutation');
      container.setAttribute('params', JSON.stringify(this.params_ || []));
      return container;
    },
    domToMutation: function(xmlElement) {
      const paramsString = xmlElement.getAttribute('params');
      this.params_ = paramsString ? JSON.parse(paramsString) : [];
      this.updateShape_();
    },
    updateShape_: function() {
      if (this.getInput('PARAMS_LABEL')) this.removeInput('PARAMS_LABEL');
      if (this.params_.length > 0) {
        const paramString = this.params_.map(p => `${p.type} ${p.name}`).join(', ');
        this.appendDummyInput('PARAMS_LABEL').appendField(`Inputs: (${paramString})`);
        this.moveInputBefore('PARAMS_LABEL', 'BODY'); 
      }
    }
  };

  Blockly.Blocks['custom_cpp_call'] = {
    init : function(){
      this.appendDummyInput()
          .appendField("Call")
          .appendField(new Blockly.FieldTextInput("myRoutine"), "FUNC_NAME")
          .appendField("with args")
          .appendField(new Blockly.FieldTextInput(""), "ARGS");
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour("#FF6680");
    }
  };

  Blockly.Blocks['custom_cpp_call_return'] = {
    init : function(){
      this.appendDummyInput()
          .appendField("Call")
          .appendField(new Blockly.FieldTextInput("myRoutine"), "FUNC_NAME")
          .appendField("with args")
          .appendField(new Blockly.FieldTextInput(""), "ARGS");
      this.setOutput(true, null); this.setColour("#FF6680");
    }
  };

  Blockly.Blocks['custom_return_statement'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck(null).appendField("return");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#FF6680"); 
      this.setTooltip("Returns a specific value from inside this function.");
    }
  };

  Blockly.Blocks['define_macro'] = {
    init: function(){
      this.appendDummyInput()
          .appendField("#define")
          .appendField(new Blockly.FieldTextInput("LED_PIN"), "NAME")
          .appendField(new Blockly.FieldTextInput("11"), "VALUE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#5CB1D6");
      this.setTooltip("Creates a global #define macro at the top of your code");
    }
  };

  Blockly.Blocks['is_digital_pin'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Is Digital Pin")
          .appendField(new Blockly.FieldDropdown([
              ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], 
              ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], 
              ["11", "11"], ["12", "12"], ["13", "13"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([["ON (HIGH)", "HIGH"], ["OFF (LOW)", "LOW"]]), "STATE");
      this.setOutput(true, "Boolean"); 
      this.setColour("#42CC8C"); 
      this.setTooltip("Checks if a specific pin is currently ON or OFF.");
    }
  };
};