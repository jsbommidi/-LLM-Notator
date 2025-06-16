import React from 'react';
import { Example } from '@/types';
import styles from './ExampleDisplay.module.css';

interface ExampleDisplayProps {
  example: Example;
  currentIndex: number;
  totalCount: number;
}

const ExampleDisplay: React.FC<ExampleDisplayProps> = ({
  example,
  currentIndex,
  totalCount,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Example {currentIndex + 1} of {totalCount}
        </h2>
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