import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Settings from '@/components/Settings';
import styles from '@/styles/Settings.module.css';

const SettingsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Settings - LLM Notator</title>
        <meta name="description" content="Configure LLM Notator settings and data sources" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Back to Annotation
          </Link>
        </div>

        <Settings />
      </main>
    </div>
  );
};

export default SettingsPage; 