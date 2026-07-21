import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import WokwiSimulator from './WokwiSimulator';

import { PUZZLE_DATABASE } from './config/puzzleDatabase';
import { toolbox } from './config/toolbox';
import { defineCustomBlocks } from './config/customBlocks';
import { defineCustomGenerators } from './config/customGenerators';

// Ensure the blocks and generators are loaded into Blockly
defineCustomBlocks();
defineCustomGenerators();

export default function MainIDE({ user, onLogout }) {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const fileInputRef = useRef(null); 
  const [generatedCode, setGeneratedCode] = useState('');
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  
  const [spriteState, setSpriteState] = useState({ x: 150, y: 100, rot: 0 });
  const [mode, setMode] = useState('hardware');

  const [editingFuncBlock, setEditingFuncBlock] = useState(null);
  const [tempParams, setTempParams] = useState([]);

  const [activePuzzle, setActivePuzzle] = useState(null);

  const saveProjectToDatabase = async () => {
    if (workspaceRef.current) {
      const blocksJson = Blockly.serialization.workspaces.save(workspaceRef.current);
      const newSaveFile = { ownerId: user.id, projectName: `${user.username}'s Robot Project`, data: blocksJson, timestamp: new Date().toISOString() };
      await fetch('http://localhost:5000/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSaveFile) });
      alert(`Saved! Open db.json in VS Code to see your data! 💾`);
    }
  };

  const loadProjectFromDatabase = async () => {
    const res = await fetch(`http://localhost:5000/projects?ownerId=${user.id}`);
    const userProjects = await res.json();
    if (userProjects.length > 0) {
      const latestProject = userProjects[userProjects.length - 1];
      workspaceRef.current.clear();
      Blockly.serialization.workspaces.load(latestProject.data, workspaceRef.current);
      alert(`Loaded ${user.username}'s project from db.json! 📂`);
    } else {
      alert("No saves found for this user in db.json.");
    }
  };

  useEffect(() => {
    window.moveSprite = (steps) => {
      setSpriteState(prev => {
        const rad = prev.rot * (Math.PI / 180);
        let newX= prev.x + (steps * Math.cos(rad));
        let newY= prev.y + (steps * Math.sin(rad));
        if (newX<0) newX = 0; if (newX>250) newX = 250;
        if(newY<0) newY = 0; if (newY>200) newY = 200;
        return { ...prev, x: newX, y: newY };
      });
    };
    window.turnSprite = (degrees) => setSpriteState(prev => ({ ...prev, rot: prev.rot + degrees }));
  }, []);

  useEffect(() => {
    window.openFunctionEditor = (block) => {
      setEditingFuncBlock(block);
      setTempParams(block.params_ ? [...block.params_] : []);
    };
  }, []);

  const saveFunctionParams = () => {
    if (editingFuncBlock) {
      editingFuncBlock.params_ = tempParams;
      editingFuncBlock.updateShape_(); 
      setEditingFuncBlock(null);
    }
  };

  const loadPuzzle = (puzzle) => {
    setActivePuzzle(puzzle);
    if (workspaceRef.current) {
      workspaceRef.current.clear(); 
      try {
        Blockly.serialization.workspaces.load(puzzle.initialBlocks, workspaceRef.current);
      } catch (err) {
        console.error("Blockly failed to load puzzle:", err);
        alert("Could not load puzzle blocks. Please re-generate this puzzle's JSON!");
      }
    }
  };

  useEffect(() => {
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox, renderer: 'zelos', theme: Blockly.Themes.Zelos,
      horizontalLayout: false, toolboxPosition: 'start',
      zoom: { controls: true, wheel: true }, trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
    });
    
    workspaceRef.current = workspace; 

    workspace.addChangeListener((event) => {
      if (event.isUiEvent) return;

      javascriptGenerator.arduinoSetup_ = {};
      javascriptGenerator.arduinoIncludes_ = {};
      javascriptGenerator.arduinoGlobals_ = {};
      javascriptGenerator.arduinoFunctions_ = {};

      const loopBlocks = javascriptGenerator.workspaceToCode(workspace);
      const includesCode = Object.values(javascriptGenerator.arduinoIncludes_).join('\n');
      const globalCode = Object.values(javascriptGenerator.arduinoGlobals_).join('\n');
      const setupCode = Object.values(javascriptGenerator.arduinoSetup_).join('\n');
      const functionsCode = Object.values(javascriptGenerator.arduinoFunctions_).join('\n');

      let finalOutput = "";
      if (includesCode) finalOutput += includesCode + "\n\n";
      if (globalCode) finalOutput += globalCode + "\n\n";
      if (functionsCode) finalOutput += functionsCode + "\n\n";
      
      finalOutput += `void setup() {\n${setupCode}\n}\n\n`; 
      finalOutput += `void loop() {\n${loopBlocks}}\n`;
      setGeneratedCode(finalOutput);
    });

    return () => workspace.dispose();
  }, []);

  useEffect(() => {
    if (workspaceRef.current){
      setTimeout(() => { Blockly.svgResize(workspaceRef.current); }, 50);
    }
  }, [mode]);

  const exportToArduino = () => {
    const blob = new Blob([generatedCode], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'myProject.ino'; link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSprite = () => {
  if (!workspaceRef.current) return;
  
  try {
    // Translate the blocks into JavaScript strings
    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    
    console.log("Executing Sprite Code:", code);
    
    // Execute the code directly in the app!
    const executeSprite = new Function(code);
    executeSprite();

  } catch (error) {
    alert("Oops! There was an error running your sprite: " + error.message);
  }
};

  return (
    <div className="app-container">
      <div className="top-bar">
        <h2>🤖 RoboBLOCK- by Ritesh <span className="greeting">Hi, {user.username}! 👋</span></h2>
        <div className="top-bar-actions">
          <button onClick={() => setMode(mode === 'hardware' ? 'simulator' : mode === 'simulator' ? 'sprite' : 'hardware')} className="action-btn purple">
            🎮 {mode === 'hardware' ? 'Play Mode' : 'Build Mode'}
          </button>
          <button onClick={() => setShowPuzzleModal(true)} className="action-btn yellow">🧩 Missions</button>
          <button onClick={exportToArduino} className="action-btn orange">⬇️ Download Code</button>
          <button onClick={loadProjectFromDatabase} className="action-btn blue">☁️ Load</button>
          <button onClick={saveProjectToDatabase} className="action-btn green">💾 Save</button>
          <button onClick={onLogout} className='action-btn red'>🚪Exit</button>
          {mode === 'sprite' && (
          <button 
            onClick={handleRunSprite}
            className="run-sprite-btn"
          >
            ▶ Run Sprite
          </button>
        )}
        </div>
      </div>

      <div className="workspace-area" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 75px)' }}>
        <div ref={blocklyDiv} style={{ flex: 1, height: '100%', position: 'relative' }} />
        
        <div className="code-panel" style={{ display: mode === 'hardware' ? 'block' : 'none' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#4ade80', fontSize: '1.1rem', fontWeight: 900 }}>💻 Secret Robot Code:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generatedCode}</pre>
        </div>

        <div className="stage-container" style={{ display: mode === 'sprite' ? 'flex' : 'none', flexDirection: 'column', width: '320px', backgroundColor: '#f1f5f9', borderLeft: '4px solid #cbd5e1', padding: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9966FF', fontSize: '1.1rem', fontWeight: 900 }}>🎮 Test Stage</h3>
          <div className="stage-display" style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '4px solid #cbd5e1', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
            <div className="sprite" style={{ position: 'absolute', left: `${spriteState.x}px`, top: `${spriteState.y}px`, transform: `rotate(${spriteState.rot}deg)`, fontSize: '45px', transition: 'all 0.2s ease-out' }}>🤖</div>
          </div>
          <div className="sprite-info" style={{ marginTop: '15px', backgroundColor: '#e2e8f0', padding: '12px', borderRadius: '12px', fontSize: '15px', fontWeight: '900', color: '#64748b', textAlign: 'center', border: '2px solid #cbd5e1' }}>
            X: {Math.round(spriteState.x)} &nbsp;|&nbsp; Y: {Math.round(Math.abs(spriteState.y-200))}
          </div>
        </div>

        <div style={{ display: mode === 'simulator' ? 'flex': 'none', flex:1}}>
          <WokwiSimulator arduinoCode={generatedCode} />
        </div>
      </div>

      {/* MODALS */}
      {editingFuncBlock && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '500px', border: '4px solid #e2e8f0', boxShadow: '0px 15px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#FF6680', fontWeight: 900 }}>⚙️ Build a Custom Block!</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <span style={{ alignSelf: 'center', fontWeight: '900', color: '#64748b', marginRight: '10px' }}>Add:</span>
              <button onClick={() => setTempParams([...tempParams, {type: 'int', name: `num${tempParams.length + 1}`}])} style={{ padding: '10px 14px', backgroundColor: '#4C97FF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 0px #2563eb' }}>+ Number</button>
              <button onClick={() => setTempParams([...tempParams, {type: 'String', name: `text${tempParams.length + 1}`}])} style={{ padding: '10px 14px', backgroundColor: '#5CB1D6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 0px #0284c7' }}>+ Text</button>
              <button onClick={() => setTempParams([...tempParams, {type: 'bool', name: `flag${tempParams.length + 1}`}])} style={{ padding: '10px 14px', backgroundColor: '#FFAB19', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 0px #d97706' }}>+ True/False</button>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '16px', minHeight: '100px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '2px solid #e2e8f0' }}>
              {tempParams.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', fontWeight: 'bold' }}>No inputs added yet.</p> : tempParams.map((param, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '900', color: '#64748b', width: '60px' }}>{param.type}</span>
                    <input value={param.name} onChange={(e) => { const newParams = [...tempParams]; newParams[index].name = e.target.value.replace(/\s+/g, '_'); setTempParams(newParams); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid #cbd5e1', fontWeight: 'bold', outline: 'none' }} />
                    <button onClick={() => setTempParams(tempParams.filter((_, i) => i !== index))} style={{ backgroundColor: '#FF6680', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 3px 0px #e11d48' }}>X</button>
                  </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEditingFuncBlock(null)} style={{ padding: '12px 20px', backgroundColor: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 0px #94a3b8' }}>Cancel</button>
              <button onClick={saveFunctionParams} style={{ padding: '12px 20px', backgroundColor: '#4ade80', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 0px #16a34a' }}>Done! ✔️</button>
            </div>
          </div>
        </div>
      )}

      {showPuzzleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '600px', maxHeight: '80vh', overflowY: 'auto', border: '4px solid #e2e8f0', boxShadow: '0px 15px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0ea5e9', fontWeight: 900 }}>🧩 Select a Mission</h2>
              <button onClick={() => setShowPuzzleModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>❌</button>
            </div>
            {Object.keys(PUZZLE_DATABASE).map(level => (
              <div key={level} style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#FFAB19', marginBottom: '10px', fontWeight: 900, fontSize: '1.2rem' }}>Level {level}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PUZZLE_DATABASE[level].map(puzzle => (
                    <button key={puzzle.id} onClick={() => { loadPuzzle(puzzle); setShowPuzzleModal(false); }} style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.1s', boxShadow: '0 4px 0px #cbd5e1' }} onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0px 0px transparent'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0px #cbd5e1'; }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                      <strong style={{ fontSize: '1.1rem', color: '#0ea5e9', fontWeight: 900 }}>{puzzle.title}</strong>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>{puzzle.instructions}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}