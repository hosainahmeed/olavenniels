import React, { useState } from 'react';
import JoditComponent from '../../components/common/JoditComponent';
import { Button } from 'antd';

function PrivacyPolicy() {
  const [content, setContent] = useState('');
  return (
    <div>
      <h1 className="text-2xl text-white font-bold mb-4">Privacy Policy</h1>
      <JoditComponent content={content} setContent={setContent} />
      <Button
        style={{
          width: '200px',
          backgroundColor: 'var(--secondary-color)',
          color: 'white',
          marginTop: '1rem',
        }}
        onClick={() => {
          console.log(content);
        }}
      >
        Update
      </Button>
    </div>
  );
}

export default PrivacyPolicy;
