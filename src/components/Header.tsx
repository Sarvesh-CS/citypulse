import React from 'react';
import Link from 'next/link';
// import Button from './Button'; - unused import

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Dynamic CMS content structure
}

export default function Header({ data }: HeaderProps) {
    // Provide fallback data if Contentstack data is not available
    if (!data) {
      return (
        <header className="header">
          <div className="header-container">
            <div className="header-logo">
              <Link href="/" className="header-logo-link">
                <span className="header-logo-text">CityPulse</span>
              </Link>
            </div>
            
            <nav className="header-nav">
              <ul className="header-nav-list">
                <li className="header-nav-item">
                  <Link href="/tours" className="header-nav-link">Tours</Link>
                </li>
                <li className="header-nav-item">
                  <Link href="/events" className="header-nav-link">Events</Link>
                </li>
                <li className="header-nav-item">
                  <Link href="/hotels" className="header-nav-link">Hotels</Link>
                </li>
                <li className="header-nav-item">
                  <Link href="/restaurants" className="header-nav-link">Restaurants</Link>
                </li>
                <li className="header-nav-item">
                  <a href="#" className="btn btn-primary">Join</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      );
    }

    const logo = data.logo || 'CityPulse';
    // const joinBtn = data.join || { title: 'Join', href: '#' };
    
    // Parse navigation links from Contentstack data structure
    // The data.links object contains navigation items like: { events: { title, href }, hotels: { title, href } }
    const navigationLinks: Array<{ title: string; href: string; key: string }> = [];
    if (data.links) {
      // Convert the links object to an array of navigation items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(data.links).forEach(([key, linkData]: [string, any]) => {
        // Skip non-object entries and entries without title/href
        if (linkData && typeof linkData === 'object' && linkData.title && linkData.href) {
          navigationLinks.push({
            title: linkData.title,
            href: linkData.href,
            key: key
          });
        }
      });
    }
    
    return (
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <Link href="/" className="header-logo-link">
              <span className="header-logo-text">{logo}</span>
            </Link>
          </div>
          
          <nav className="header-nav">
            <ul className="header-nav-list">
              {navigationLinks.map((link, index: number) => (
                <li key={link.key || index} className="header-nav-item">
                  <Link href={link.href} className="header-nav-link">
                    {link.title}
                  </Link>
                </li>
              ))}
              {/* <li className="header-nav-item">
                <a href={joinBtn.href} className="btn btn-primary">
                  {joinBtn.title}
                </a>
              </li> */}
            </ul>
          </nav>
        </div>
      </header>
    );
}