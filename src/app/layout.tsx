"use client"; // Add this directive to mark RootLayout as a Client Component

import { Orbitron, Roboto_Mono } from "next/font/google";
import "../styles/globalsStyles";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${robotoMono.variable} antialiased`}
      >
        {children}

        <style jsx global>{`
          /* Reset default styles */
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background: #1C2526; /* Dark background matching the form */
            color: #FFFFFF; /* White text */
            font-family: var(--font-roboto-mono), monospace; /* Default to Roboto Mono */
            overflow-x: hidden;
          }

          /* Apply Orbitron for headings */
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-orbitron), sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 10px rgba(0, 163, 224, 0.7); /* Blue glow on headings */
          }

          /* Links */
          a {
            color: #00A3E0; /* Electric blue for links */
            text-decoration: none;
            transition: all 0.3s ease;
          }

          a:hover {
            text-shadow: 0 0 10px rgba(0, 163, 224, 0.7); /* Blue glow on hover */
          }

          /* Ensure all text inherits the white color unless overridden */
          p, span, div {
            color: #FFFFFF;
            font-family: var(--font-roboto-mono), monospace;
          }

          /* Add a subtle glow effect to the entire page */
          body {
            box-shadow: inset 0 0 50px rgba(0, 163, 224, 0.2); /* Subtle blue glow */
            animation: glowPulse 2s infinite alternate;
          }

          /* Glow animation */
          @keyframes glowPulse {
            0% { box-shadow: inset 0 0 50px rgba(0, 163, 224, 0.2); }
            100% { box-shadow: inset 0 0 70px rgba(0, 163, 224, 0.4); }
          }

          /* Ensure the root element takes up the full viewport */
          #__next {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: #1C2526;
          }
        `}</style>
      </body>
    </html>
  );
}