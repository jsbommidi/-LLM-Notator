import React, { useState } from 'react';
import Select from 'react-select';
import { ErrorCategory } from '@/types';
import styles from './AnnotationForm.module.css';

const errorCategories: ErrorCategory[] = [
  { value: 'factual_error', label: 'Factual Error' },
  { value: 'logical_error', label: 'Logical Error' },
  { value: 'bias', label: 'Bias' },
  { value: 'toxicity', label: 'Toxicity' },
  { value: 'hallucination', label: 'Hallucination' },
  { value: 'off_topic', label: 'Off Topic' },
  { value: 'repetition', label: 'Repetition' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'other', label: 'Other' },
];

interface ErrorCategoriesBoxProps {
  isPlaceholder?: boolean;
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  isDisabled?: boolean;
}

const ErrorCategoriesBox: React.FC<ErrorCategoriesBoxProps> = ({
  isPlaceholder = false,
  selectedLabels,
  onLabelsChange,
  isDisabled = false,
}) => {
  // Auto-populate with all error categories if it's placeholder
  const displayedSelectedLabels = isPlaceholder ? 
    errorCategories.map(cat => cat.value) : 
    selectedLabels;

  const handleLabelChange = (selectedOptions: any) => {
    if (isPlaceholder) return; // Don't allow changes in placeholder mode
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    onLabelsChange(values);
  };

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <h3 className={styles.sectionTitle}>Error Categories</h3>
        <Select
          isMulti
          options={errorCategories}
          value={errorCategories.filter(category => displayedSelectedLabels.includes(category.value))}
          onChange={handleLabelChange}
          placeholder={isPlaceholder ? "Error categories will appear here..." : "Select error categories..."}
          className={styles.select}
          classNamePrefix="select"
          isDisabled={isDisabled || isPlaceholder}
        />
      </div>
    </div>
  );
};

export default ErrorCategoriesBox; 