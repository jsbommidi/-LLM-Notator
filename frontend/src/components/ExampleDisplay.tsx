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
  const isFirstExample = currentIndex === 0;
  const isLastExample = currentIndex === totalCount - 1;
  const isPlaceholder = example.id === 'placeholder';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            {totalCount === 0 ? 'Prompt & Response' : `Example ${currentIndex + 1} of ${totalCount}`}
          </h2>
          {totalCount > 0 && (
            <div className={styles.navigationButtons}>
              <button
                onClick={onPrevious}
                disabled={isFirstExample || isLoading}
                className={`${styles.navButton} ${styles.previousButton}`}
              >
                ← Previous
              </button>
              <button
                onClick={onNext}
                disabled={isLastExample || isLoading}
                className={`${styles.navButton} ${styles.nextButton}`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
        <div className={styles.id}>ID: {example.id}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Prompt</h3>
          <div className={`${styles.promptBox} ${isPlaceholder ? styles.placeholder : ''}`}>
            {example.prompt}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Response</h3>
          <div className={`${styles.responseBox} ${isPlaceholder ? styles.placeholder : ''}`}>
            {example.response}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleDisplay; 