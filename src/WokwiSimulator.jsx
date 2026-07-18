import React, { useRef, useState, useEffect } from 'react';
import { CPU, avrInstruction, AVRIOPort, portBConfig, portDConfig, AVRTimer, timer0Config, AVRUSART, usart0Config, AVRADC, adcConfig } from 'avr8js';
import '@wokwi/elements';

const loadHex = (source, target) => {
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substr(7, 2) === '00') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
      }
    }
  }
};

export default function WokwiSimulator({ arduinoCode }) {
  const [status, setStatus] = useState("Ready to run! 🟢");
  const runnerRef = useRef(null); 
  
  const[isConsoleOpen, setIsConsoleOpen] = useState(true);

  const [serialOutput, setSerialOutput] = useState("");
  const consoleEndRef = useRef(null);

  const [components, setComponents] = useState([
    { id: '1', type: 'led', pin: '13', color: 'red' }
  ]);
  
  const [selectedType, setSelectedType] = useState('led');
  const [selectedPin, setSelectedPin] = useState('2');

  const componentRefs = useRef({}); 
  const inputStates = useRef({}); 

  const availablePins = ['2','3','4','5','6','7','8','9','10','11','12','13', 'A0','A1','A2','A3','A4','A5'];

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialOutput]);

  const handleAddComponent = () => {
    if (components.find(c => String(c.pin) === String(selectedPin))) {
      alert("That pin is already in use!");
      return;
    }
    const newComp = { id: Date.now().toString(), type: selectedType, pin: selectedPin, color: 'red' };
    setComponents([...components, newComp]);
  };

  const handleRemoveComponent = (idToRemove) => {
    setComponents(components.filter(c => c.id !== idToRemove));
  };

  const handleRunSimulation = async () => {
    if (!arduinoCode) {
      setStatus("No blocks to run! ❌");
      return;
    }

    setStatus("Compiling... ☁️");
    if (runnerRef.current) cancelAnimationFrame(runnerRef.current);
    
    setSerialOutput("");

    try {
      const response = await fetch('/wokwi-api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sketch: arduinoCode })
      });
      
      if (!response.ok) throw new Error(`Proxy Error ${response.status}`);
      const data = await response.json();

      if (data.hex) {
        setStatus("Robot is Running! 🚀");
        startCPU(data.hex);
      } else if (data.stderr) {
        setStatus("C++ Error! Check Console ⚠️");
        console.error("C++ Error:", data.stderr);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleStopSimulation = () => {
    if (runnerRef.current) {
      cancelAnimationFrame(runnerRef.current);
      runnerRef.current = null;
    }
    setStatus("Stopped 🛑");
    components.forEach(comp => {
      const el = componentRefs.current[comp.id];
      if (el) {
        if (comp.type === 'led') el.value = false;
        if (comp.type === 'buzzer') el.hasSignal = false;
      }
    });
  };

  const startCPU = (hexData) => {
    const progData = new Uint8Array(32768); 
    loadHex(hexData, progData);
    
    const cpu = new CPU(new Uint16Array(progData.buffer));
    const timer0 = new AVRTimer(cpu, timer0Config);

    const usart = new AVRUSART(cpu, usart0Config, 16e6); 
    usart.onByteTransmit = (value) => {
      const char = String.fromCharCode(value);
      setSerialOutput(prev => prev + char);
    };

    const adc = new AVRADC(cpu, adcConfig);

    const updateOutputs = (portStartPin, portValue) => {
      components.forEach(comp => {
        const pinNum = parseInt(comp.pin);
        if (!isNaN(pinNum) && pinNum >= portStartPin && pinNum <= portStartPin + 7) {
          const bit = pinNum - portStartPin;
          const isHigh = (portValue & (1 << bit)) !== 0;
          
          const el = componentRefs.current[comp.id];
          if (el) {
            if (comp.type === 'buzzer') el.hasSignal = isHigh;
            else if (comp.type === 'led') el.value = isHigh;
          }
        }
      });
    };

    const portB = new AVRIOPort(cpu, portBConfig);
    portB.addListener((value) => updateOutputs(8, value));

    const portD = new AVRIOPort(cpu, portDConfig);
    portD.addListener((value) => updateOutputs(0, value));

    components.forEach(comp => {
      if (comp.type === 'button') {
        const pinNum = parseInt(comp.pin);
        if (!isNaN(pinNum)) {
          if (pinNum >= 8 && pinNum <= 13) portB.setPin(pinNum - 8, true);
          if (pinNum >= 0 && pinNum <= 7) portD.setPin(pinNum, true);
        }
      }
    });

    const executeInstructions = () => {
      let bVal = cpu.data[portBConfig.PIN];
      let dVal = cpu.data[portDConfig.PIN];

      components.forEach(comp => {
        // --- THE ANALOG INJECTION ---
        if (comp.type === 'potentiometer' && String(comp.pin).startsWith('A')) {
          const channel = parseInt(String(comp.pin).replace('A', ''));
          // Pull the voltage from our custom HTML slider state (Defaults to 0)
          adc.channelValues[channel] = inputStates.current[comp.pin] || 0;
          return;
        }

        // --- THE DIGITAL LOGIC ---
        if (comp.type !== 'button' && comp.type !== 'switch') return;
        const pinNum = parseInt(comp.pin);
        if (isNaN(pinNum)) return;

        const isPressed = inputStates.current[comp.pin];
        let bitValue = 0;
        if (comp.type === 'button') bitValue = isPressed ? 0 : 1; 
        if (comp.type === 'switch') bitValue = isPressed ? 1 : 0; 

        if (pinNum >= 8 && pinNum <= 13) {
          const bit = pinNum - 8;
          if (bitValue) bVal |= (1 << bit); else bVal &= ~(1 << bit);
        } else if (pinNum >= 0 && pinNum <= 7) {
          const bit = pinNum;
          if (bitValue) dVal |= (1 << bit); else dVal &= ~(1 << bit);
        }
      });

      cpu.data[portBConfig.PIN] = bVal;
      cpu.data[portDConfig.PIN] = dVal;

      for (let i = 0; i < 500000; i++) {
        avrInstruction(cpu);
        cpu.tick();
      }
      runnerRef.current = requestAnimationFrame(executeInstructions);
    };

    executeInstructions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#f1f5f9', borderLeft: '4px solid #cbd5e1' }}>
      
      <div style={{ padding: '15px 20px', backgroundColor: '#e2e8f0', borderBottom: '4px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: '0', color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 900 }}>⚡ Virtual Testbed</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <div style={{ padding: '8px 14px', backgroundColor: status.includes('Running') ? '#dcfce7' : status.includes('Error') ? '#ffe4e6' : '#fef9c3', color: status.includes('Running') ? '#16a34a' : status.includes('Error') ? '#e11d48' : '#ca8a04', borderRadius: '12px', fontWeight: '900', fontSize: '13px', border: status.includes('Running') ? '2px solid #bbf7d0' : status.includes('Error') ? '2px solid #fda4af' : '2px solid #fef08a' }}>
            {status}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRunSimulation} style={{ padding: '10px 20px', backgroundColor: '#4ade80', color: 'white', border: '2px solid #22c55e', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 5px 0px #16a34a' }}>▶️ Run</button>
            <button onClick={handleStopSimulation} disabled={!status.includes('Running')} style={{ padding: '10px 20px', backgroundColor: status.includes('Running') ? '#ef4444' : '#fca5a5', color: 'white', border: '2px solid #dc2626', borderRadius: '12px', cursor: status.includes('Running') ? 'pointer' : 'not-allowed', fontWeight: 900, boxShadow: status.includes('Running') ? '0 5px 0px #b91c1c' : 'none', transform: status.includes('Running') ? 'none' : 'translateY(5px)' }}>⏹️ Stop</button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '15px 20px', borderBottom: '2px solid #cbd5e1', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, color: '#475569' }}>📦 Parts Box:</span>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #cbd5e1', fontWeight: 'bold' }}>
          <option value="led">🔴 LED</option>
          <option value="buzzer">🔊 Buzzer</option>
          <option value="button">🔘 Push Button</option>
          <option value="switch">🎚️ Slide Switch</option>
          <option value="potentiometer">🎛️ Potentiometer</option>
        </select>
        <span style={{ fontWeight: 900, color: '#475569' }}>on Pin</span>
        <select value={selectedPin} onChange={(e) => setSelectedPin(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #cbd5e1', fontWeight: 'bold' }}>
          {availablePins.map(pin => <option key={pin} value={pin}>{pin}</option>)}
        </select>
        <button onClick={handleAddComponent} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>
          ➕ Add to Desk
        </button>
      </div>

      <div style={{ flex: 1, backgroundColor: '#e0f2fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '30px', padding: '20px', overflowY: 'auto' }}>
         
         <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)', padding: '30px', borderRadius: '20px', border: '2px dashed #94a3b8', minWidth: '80%', minHeight: '150px' }}>
           {components.length === 0 && <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Desk is empty. Add some parts!</span>}
           {components.map((comp) => (
             <div key={comp.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative' }}>
               <button onClick={() => handleRemoveComponent(comp.id)} style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}>×</button>
               <span style={{ fontWeight: '900', color: '#475569', fontSize: '13px', background: 'white', padding: '4px 12px', borderRadius: '8px', border: '2px solid #cbd5e1' }}>Pin {comp.pin}</span>
               
               <div style={{ transform: 'scale(1.2)', margin: '15px' }}>
                 {comp.type === 'led' && <wokwi-led ref={el => componentRefs.current[comp.id] = el} color={comp.color}></wokwi-led>}
                 {comp.type === 'buzzer' && <wokwi-buzzer ref={el => componentRefs.current[comp.id] = el}></wokwi-buzzer>}
                 {comp.type === 'button' && <div onMouseDown={() => inputStates.current[comp.pin] = true} onMouseUp={() => inputStates.current[comp.pin] = false} onMouseLeave={() => inputStates.current[comp.pin] = false} style={{ cursor: 'pointer' }}><wokwi-pushbutton color="blue"></wokwi-pushbutton></div>}
                 {comp.type === 'switch' && <div onClick={(e) => { inputStates.current[comp.pin] = !inputStates.current[comp.pin]; e.currentTarget.querySelector('wokwi-slide-switch').value = inputStates.current[comp.pin]; }} style={{ cursor: 'pointer' }}><wokwi-slide-switch></wokwi-slide-switch></div>}
                 
                 {/* THE FIX: Render the 3D Knob AND a guaranteed HTML Slider underneath it! */}
                 {comp.type === 'potentiometer' && (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                     <wokwi-potentiometer></wokwi-potentiometer>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', backgroundColor: 'white', padding: '8px', borderRadius: '8px', border: '2px solid #cbd5e1' }}>
                       <input 
                         type="range" 
                         min="0" 
                         max="5" 
                         step="0.1" 
                         defaultValue="0"
                         onChange={(e) => {
                           // Instantly jams the voltage into our physics engine state
                           inputStates.current[comp.pin] = Number(e.target.value);
                         }}
                         style={{ width: '80px', cursor: 'pointer' }}
                       />
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Voltage Slider</span>
                     </div>
                   </div>
                 )}

               </div>
             </div>
           ))}
         </div>

         <div style={{ transform: 'scale(1)', marginTop: '0px' }}>
           <wokwi-arduino-uno></wokwi-arduino-uno>
         </div>

      </div>

      <div style={{
        height: isConsoleOpen ? '180px' : '30px',
        backgroundColor: '#1e293b',
        borderTop: '4px Solid #0f172a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.2s ease-in-out'
      }}>
        <div style={{
          padding: '4px 15px',
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
          <span>💻 {isConsoleOpen ? 'Hide Serial Monitor': 'Show Serial Monitor'}</span>
          <button style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer'}}>
            {isConsoleOpen ? '▼' : '▲'}
          </button>
        </div>

        {isConsoleOpen && (
          <div style={{ flex: 1, padding: '10px 15px', overflowY: 'auto', color: '#22c55e', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>(9600 baud)</span>
              <button onClick={() => setSerialOutput("")} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: '1px 6px', fontSize: '10px'}}>Clear</button>
            </div>
            {serialOutput || <span style={{color: '#475569'}}>Waiting for Serial data...</span>}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>

{/*      <div style={{ height: '180px', backgroundColor: '#1e293b', borderTop: '4px solid #0f172a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 15px', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💻 Serial Monitor (9600 baud)</span>
          <button onClick={() => setSerialOutput("")} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px', fontSize: '11px' }}>Clear</button>
        </div>
        <div style={{ flex: 1, padding: '10px 15px', overflowY: 'auto', color: '#22c55e', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {serialOutput || <span style={{ color: '#475569' }}>Waiting for serial data...</span>}
          <div ref={consoleEndRef} />
        </div>
      </div>
*/}
    </div>
  );
}