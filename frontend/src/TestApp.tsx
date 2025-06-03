import React, { useState } from 'react';

function TestApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>React Test Application</h1>
      <p>This is a basic test to verify React rendering.</p>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      >
        <h2>Counter: {count}</h2>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '8px 16px',
            background: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Increment
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: '8px 16px',
            background: '#ddd',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default TestApp;
