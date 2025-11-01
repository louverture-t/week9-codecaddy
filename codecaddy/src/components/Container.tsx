import React from 'react';

type Props = React.PropsWithChildren<{ className?: string }>;

// Shared page width wrapper to keep a consistent layout across pages
// Matches existing pages that use: "max-w-4xl mx-auto"
const Container: React.FC<Props> = ({ children, className = '' }) => {
  return <div className={`max-w-4xl mx-auto ${className}`}>{children}</div>;
};

export default Container;
