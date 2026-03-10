import React from 'react';
import { cn } from '../../utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn("max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6", className)}>
      {children}
    </div>
  );
};
