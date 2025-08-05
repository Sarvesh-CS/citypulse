import React from 'react';

interface ButtonProps {
  text: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({ 
  text, 
  href, 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false 
}: ButtonProps) {
  // Base styles that are common to all buttons
  const baseStyles = "px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block text-center";
  
  // Combine base styles with custom className
  const combinedStyles = `${baseStyles} ${className}`;

  // If href is provided, render as a link
  if (href) {
    return (
      <a 
        href={href} 
        className={combinedStyles}
        onClick={onClick}
      >
        {text}
      </a>
    );
  }

  // Otherwise render as a button
  return (
    <button 
      type={type}
      className={combinedStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
} 