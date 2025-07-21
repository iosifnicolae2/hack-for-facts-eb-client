import React from 'react';

export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeQuery = escapeRegExp(query.trim());
  if (!safeQuery) return text;

  const regex = new RegExp(`(${safeQuery})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? <mark key={idx} className="bg-yellow-300 text-black">{part}</mark> : <React.Fragment key={idx}>{part}</React.Fragment>
      )}
    </>
  );
}; 