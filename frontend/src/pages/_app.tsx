import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function BarakahApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#10b981" />
        <meta name="author" content="Barakah AI Agents" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Barakah AI Agents" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@BarakahAI" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default BarakahApp;