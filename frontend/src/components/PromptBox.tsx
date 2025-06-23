import React from 'react';
import { Example } from '@/types';
import styles from './ExampleDisplay.module.css';

interface PromptBoxProps {
  example: Example;
  isPlaceholder?: boolean;
}

const PromptBox: React.FC<PromptBoxProps> = ({
  example,
  isPlaceholder = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Prompt</h3>
        <div className={`${styles.promptBox} ${isPlaceholder ? styles.placeholder : ''}`}>
          {example.prompt}
        </div>
      </div>
    </div>
  );
};

export default PromptBox; 