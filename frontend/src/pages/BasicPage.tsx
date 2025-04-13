/**
 * frontend/src/pages/BasicPage.tsx
 * Super simple page with no dependencies
 */
import React from 'react';

const BasicPage: React.FC = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Basic Page</h1>
      <p>This is a very basic page with minimal dependencies.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
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
            marginRight: '10px'
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
            cursor: 'pointer' 
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BasicPage; 