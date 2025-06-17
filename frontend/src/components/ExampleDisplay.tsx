import React from 'react';
import { Example } from '@/types';
import styles from './ExampleDisplay.module.css';

interface ExampleDisplayProps {
  example: Example;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

const ExampleDisplay: React.FC<ExampleDisplayProps> = ({
  example,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  isLoading = false,
}) => {
  const isFirstSample = currentIndex === 0;
  const isLastSample = currentIndex === totalCount - 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            Sample {currentIndex + 1} of {totalCount}
          </h2>
          <div className={styles.navigationButtons}>
            <button
              onClick={onPrevious}
              disabled={isFirstSample || isLoading}
              className={`${styles.navButton} ${styles.previousButton}`}
            >
              ← Previous
            </button>
            <button
              onClick={onNext}
              disabled={isLastSample || isLoading}
              className={`${styles.navButton} ${styles.nextButton}`}
            >
              Next →
            </button>
          </div>
        </div>
        <div className={styles.id}>ID: {example.id}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Prompt</h3>
          <div className={styles.promptBox}>
            {example.prompt}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Response</h3>
          <div className={styles.responseBox}>
            {example.response}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleDisplay; 