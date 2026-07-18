import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export function initSpriteBlocks() {
  
  // --- SPRITE VISUAL BLOCKS ---
  Blockly.Blocks['sprite_move'] = {
    init: function() {
      this.appendValueInput("STEPS").setCheck("Number")
          .appendField("Move Panda");
      this.appendDummyInput().appendField("steps");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#5C81A6"); 
    }
  };

  Blockly.Blocks['sprite_turn'] = {
    init: function() {
      this.appendValueInput("DEGREES").setCheck("Number")
          .appendField("Turn Panda ↻");
      this.appendDummyInput().appendField("degrees");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#5C81A6"); 
    }
  };

  // --- SPRITE JAVASCRIPT GENERATORS ---
  javascriptGenerator.forBlock['sprite_move'] = function(block) {
    const steps = javascriptGenerator.valueToCode(block, 'STEPS', javascriptGenerator.ORDER_ATOMIC) || '10';
    return `window.moveSprite(${steps});\n`;
  };

  javascriptGenerator.forBlock['sprite_turn'] = function(block) {
    const degrees = javascriptGenerator.valueToCode(block, 'DEGREES', javascriptGenerator.ORDER_ATOMIC) || '15';
    return `window.turnSprite(${degrees});\n`;
  };
}