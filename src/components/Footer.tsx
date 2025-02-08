
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          Managed by{' '}
          <span className="font-semibold">S Mohamed Ahsan</span> |{' '}
          <a href="mailto:ahsansaleem2006@gmail.com" className="hover:text-blue-300 transition-colors">
            ahsansaleem2006@gmail.com
          </a>{' '}
          |{' '}
          <a
            href="https://linktr.ee/mohamedahsan37"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition-colors"
          >
            Linktree
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
