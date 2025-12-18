
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Try to format JSON for better readability
  let formattedCode = code;
  try {
      formattedCode = JSON.stringify(JSON.parse(code), null, 2);
  } catch (e) {
      // Not valid JSON, display as is
  }

  return (
    <div className="relative bg-slate-800 rounded-md text-sm h-full flex flex-col">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-md text-slate-300 hover:bg-slate-600 transition-colors z-10"
        aria-label="Copy code"
      >
        {isCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )}
      </button>
      <pre className="whitespace-pre-wrap break-all flex-grow overflow-y-auto p-3 pt-4">
        <code>{formattedCode}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
