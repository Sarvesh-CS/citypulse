"use client"
import React from 'react';
// import Button from './Button'; - unused import

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ContentCardHeader({ data }: { data: any }) {
    const header = data.content_card_page_header[0];
  return (
    <div className="content-card-header">
        <div className="page-content">
        <div className="container-wrapper">
          <div className="hero-section">
            <h1 className="hero-title">
            {header.content_card_page_title}
            </h1>
            <p className="hero-subtitle">
                {header.content_card_page_subtitle}
            </p>
          </div>
        </div>
        </div>
    </div>
  ) 
}