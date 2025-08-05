import React from 'react'
import Link from 'next/link'
import Button from './Button';

export default function Header({ data }: { data: any }) {
    const logo = data.logo;
    const joinBtn = data.join;
    const signinBtn = data.sign_in;
    const links = Object.entries(data.links); // work on this

  return (
    <div> 
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="logo">{logo}</h1>
              </Link>
            </div>

            {/* Links */}
            <div className="flex items-center justify-center">
            {links.map(([key, {title, href}]: any) => {
              return (
                  <Link key={key} href={href} className="nav-link">{title}</Link>
                )
              })}
              </div>
            
            {/* Navigation */}
            <nav className="responsive-nav">
              <div className="flex items-center space-x-4">
                <button className="nav-button nav-button-secondary">
                  {joinBtn.title}
                </button>
                <button className="nav-button nav-button-primary">
                  {signinBtn.title}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </div>
  )
}