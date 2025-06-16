import React, { useState } from 'react';
import Select from 'react-select';
import { ErrorCategory, AnnotationRequest } from '@/types';
import styles from './AnnotationForm.module.css';

interface AnnotationFormProps {
  exampleId: string;
  onSubmit: (annotation: AnnotationRequest) => Promise<void>;
  isLoading?: boolean;
}

const ERROR_CATEGORIES: ErrorCategory[] = [
  { value: 'accuracy', label: 'Accuracy' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'completeness', label: 'Completeness' },
  { value: 'helpfulness', label: 'Helpfulness' },
  { value: 'safety', label: 'Safety' },
  { value: 'bias', label: 'Bias' },
  { value: 'coherence', label: 'Coherence' },
  { value: 'factual_error', label: 'Factual Error' },
  { value: 'formatting', label: 'Formatting' },
];

const AnnotationForm: React.FC<AnnotationFormProps> = ({
  exampleId,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedLabels, setSelectedLabels] = useState<ErrorCategory[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLabels.length === 0) {
      alert('Please select at least one category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const annotation: AnnotationRequest = {
        id: exampleId,
        labels: selectedLabels.map(label => label.value),
        notes: notes.trim(),
      };
      
      await onSubmit(annotation);
      
      // Reset form after successful submission
      setSelectedLabels([]);
      setNotes('');
    } catch (error) {
      console.error('Failed to submit annotation:', error);
      alert('Failed to submit annotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLabelChange = (newValue: readonly ErrorCategory[]) => {
    setSelectedLabels([...newValue]);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Add Annotation</h3>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="categories" className={styles.label}>
            Error Categories *
          </label>
          <Select
            id="categories"
            isMulti
            value={selectedLabels}
            onChange={handleLabelChange}
            options={ERROR_CATEGORIES}
            className={styles.select}
            classNamePrefix="select"
            placeholder="Select error categories..."
            isDisabled={isLoading || isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="notes" className={styles.label}>
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional comments or observations..."
            className={styles.textarea}
            rows={4}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubmitting || selectedLabels.length === 0}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Annotation'}
        </button>
      </form>
    </div>
  );
};

export default AnnotationForm; 