"use client"
import React from 'react'

interface LoadingSpinnerProps {
  isVisible?: boolean;
}

export default function LoadingSpinner({ isVisible = true }: LoadingSpinnerProps) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
} 