import type { CSSProperties, ReactNode } from 'react';

type RevealStyle = CSSProperties & {
  '--reveal-delay': string;
  '--reveal-distance': string;
};

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
};

export default function PageReveal({
  children,
  delay = 0,
  className = '',
  distance = 34,
}: Props) {
  const style: RevealStyle = {
    '--reveal-delay': `${delay}s`,
    '--reveal-distance': `${distance}px`,
  };

  return (
    <div style={style} className={`reveal-block ${className}`}>
      {children}
    </div>
  );
}
