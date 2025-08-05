import React from 'react';
import Link from 'next/link'

interface FooterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // Dynamic CMS content structure
}

export default function Footer({ data }: FooterProps) {
  
  if (!data) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Main Footer Content */}
          <div className="footer-main">
            {/* Company Section */}
            <div className="footer-section footer-company">
              <Link href="/">
                <h2 className="footer-logo">{data.logo}</h2>
              </Link>
              <p className="footer-tagline">{data.logo}</p>
              <div className="footer-social">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {Object.entries(data.social).map(([key, { title, href }]: any) => {
                  // Only show social links that have both title and href
                  if (title && href) {
                    return (
                      <Link key={key} href={href} className="footer-social-link">
                        {title}
                      </Link>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="footer-section">
              <h3 className="footer-section-title">{data.links.title}</h3>
              <ul className="footer-links">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {Object.entries(data.links).map(([key, value]: any) => {
                  // Skip the title property
                  if (key === 'title') return null;
                  
                  return (
                    <li key={key}>
                      <Link href={value.href} className="footer-link">
                        {value.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-section">
              <h3 className="footer-section-title">{data.support.title}</h3>
              <ul className="footer-links">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {Object.entries(data.support).map(([key, value]: any) => {
                  // Skip the title property
                  if (key === 'title') return null;
                  
                  return (
                    <li key={key}>
                      <Link href={value.href} className="footer-link">
                        {value.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Newsletter Section */}
            <div className="footer-section">
              <h3 className="footer-section-title">
                {data.newsletter.newsletter_title}
              </h3>
              <p className="footer-newsletter-text">
                {data.newsletter.newsletter_text}
              </p>
              <div className="footer-newsletter">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="footer-newsletter-input"
                />
                <button className="footer-newsletter-button">
                  {data.newsletter.subscribe_btn}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">
                © {currentYear} {data.logo}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 