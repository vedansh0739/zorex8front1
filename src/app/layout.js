
export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
}
import './globals.css'
import { Inter } from 'next/font/google'
const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '700', '900'], // Added 900 for extra bold
	variable: '--font-inter', // This allows us to use it as a CSS variable
  })
  
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
export default function RootLayout({ children }) {
  return (
	<html lang="en" className={`${inter.variable} font-sans`}>
		 <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
		<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
/>

      </head>
      <body >
        <header>
          {/* Your header content */}
        </header>
        <main>{children}</main>
        <footer>
          {/* Your footer content */}
        </footer>
      </body>
    </html>
  );
}