import React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationProps {
  isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  isLoading = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.spacer}></div>
      
      <div className={styles.actions}>
        <Link href="/archive" className={`${styles.button} ${styles.compactButton} ${styles.archiveButton}`}>
          📚 Archive
        </Link>
        <Link href="/settings" className={`${styles.button} ${styles.compactButton} ${styles.settingsButton}`}>
          ⚙️ Settings
        </Link>
      </div>
    </div>
  );
};

export default Navigation; 