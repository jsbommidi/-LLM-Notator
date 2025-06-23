import React from 'react';
import { Example } from '@/types';
import styles from './ExampleDisplay.module.css';

interface ResponseBoxProps {
  example: Example;
  isPlaceholder?: boolean;
}

const ResponseBox: React.FC<ResponseBoxProps> = ({
  example,
  isPlaceholder = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Response</h3>
        <div className={`${styles.responseBox} ${isPlaceholder ? styles.placeholder : ''}`}>
          {example.response}
        </div>
      </div>
    </div>
  );
};

export default ResponseBox; 