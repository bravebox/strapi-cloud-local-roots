import React, { useState, useEffect } from 'react';
import { MonthlyStatusData } from '../types';

interface JsonOutputProps {
  data: MonthlyStatusData;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  
  const formattedJson = JSON.stringify(data, null, 2);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
  };
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="bg-white backdrop-filter backdrop-blur-sm bg-opacity-90 border border-gray-200 rounded-lg p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">JSON Output</h3>
        <button
          onClick={copyToClipboard}
          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-600"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
        {formattedJson}
      </pre>
    </div>
  );
};

export default JsonOutput;