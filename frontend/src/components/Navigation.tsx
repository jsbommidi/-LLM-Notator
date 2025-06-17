import React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationProps {
  onExport: () => void;
  isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  onExport,
  isLoading = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.spacer}></div>
      
      <div className={styles.actions}>
        <Link href="/settings" className={`${styles.button} ${styles.compactButton} ${styles.settingsButton}`}>
          ⚙️ Settings
        </Link>
        <button
          onClick={onExport}
          disabled={isLoading}
          className={`${styles.button} ${styles.compactButton} ${styles.exportButton}`}
        >
          📊 Export
        </button>
      </div>
    </div>
  );
};

export default Navigation; 