import React from 'react';

interface NewTagProps {
  className?: string;
}

export function NewTag({ className = "" }: NewTagProps) {
  return (
    <div className={`absolute top-0 left-0 bg-black text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shadow-sm ${className}`}
      style={{ 
        backgroundColor: 'black !important', 
        color: 'white !important'
      }}
    >
      NEW
    </div>
  );
}