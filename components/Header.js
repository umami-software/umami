import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="container">
      <h1>
        <Link href="/">
          <a>umami</a>
        </Link>
      </h1>
    </header>
  );
}
