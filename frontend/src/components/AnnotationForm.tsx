import React, { useState } from 'react';
import Select from 'react-select';
import { AnnotationRequest, ErrorCategory } from '@/types';
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

interface AnnotationFormProps {
  exampleId: string;
  onSubmit: (annotation: AnnotationRequest) => Promise<void>;
  isLoading?: boolean;
}

const AnnotationForm: React.FC<AnnotationFormProps> = ({
  exampleId,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLabels.length === 0) {
      alert('Please select at least one label.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        id: exampleId,
        labels: selectedLabels,
        notes: notes.trim(),
      });
      
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

  const handleLabelChange = (selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedLabels(values);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Annotate this Example</h3>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="labels">
            Error Categories *
          </label>
          <Select
            id="labels"
            isMulti
            options={errorCategories}
            value={errorCategories.filter(category => selectedLabels.includes(category.value))}
            onChange={handleLabelChange}
            placeholder="Select error categories..."
            className={styles.select}
            classNamePrefix="select"
            isDisabled={isLoading || isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="notes">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or comments..."
            className={styles.textarea}
            disabled={isLoading || isSubmitting}
            rows={4}
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