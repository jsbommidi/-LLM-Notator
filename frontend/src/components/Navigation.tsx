import React from 'react';
import styles from './Navigation.module.css';

interface NavigationProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onExport,
  isLoading = false,
}) => {
  const isFirstExample = currentIndex === 0;
  const isLastExample = currentIndex === totalCount - 1;

  return (
    <div className={styles.container}>
      <div className={styles.navigationButtons}>
        <button
          onClick={onPrevious}
          disabled={isFirstExample || isLoading}
          className={`${styles.button} ${styles.previousButton}`}
        >
          ← Previous
        </button>

        <div className={styles.counter}>
          {currentIndex + 1} / {totalCount}
        </div>

        <button
          onClick={onNext}
          disabled={isLastExample || isLoading}
          className={`${styles.button} ${styles.nextButton}`}
        >
          Next →
        </button>
      </div>

      <div className={styles.actions}>
        <button
          onClick={onExport}
          disabled={isLoading}
          className={`${styles.button} ${styles.exportButton}`}
        >
          📊 Export Annotations
        </button>
      </div>
    </div>
  );
};

export default Navigation; 