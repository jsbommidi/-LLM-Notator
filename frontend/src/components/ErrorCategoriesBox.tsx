import React, { useState } from 'react';
import { ErrorCategory } from '@/types';
import styles from './AnnotationForm.module.css';

const defaultErrorCategories: ErrorCategory[] = [
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

interface SelectedCategory {
  value: string;
  label: string;
  note?: string;
}

interface ErrorCategoriesBoxProps {
  isPlaceholder?: boolean;
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  categoryNotes?: Record<string, string>;
  onCategoryNotesChange?: (notes: Record<string, string>) => void;
  isDisabled?: boolean;
}

const ErrorCategoriesBox: React.FC<ErrorCategoriesBoxProps> = ({
  isPlaceholder = false,
  selectedLabels,
  onLabelsChange,
  categoryNotes = {},
  onCategoryNotesChange,
  isDisabled = false,
}) => {
  const [customCategories, setCustomCategories] = useState<ErrorCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Combine default and custom categories
  const allCategories = [...defaultErrorCategories, ...customCategories];

  // Auto-populate with all error categories if it's placeholder
  const displayedSelectedLabels = isPlaceholder ? 
    allCategories.map(cat => cat.value) : 
    selectedLabels;

  const handleAddCustomCategory = () => {
    if (customCategoryInput.trim()) {
      const newCategory = {
        value: customCategoryInput.toLowerCase().replace(/\s+/g, '_'),
        label: customCategoryInput.trim()
      };
      setCustomCategories(prev => [...prev, newCategory]);
      setCustomCategoryInput('');
    }
  };

  const handleCategoryNoteChange = (categoryValue: string, note: string) => {
    const newNotes = {
      ...categoryNotes,
      [categoryValue]: note
    };
    onCategoryNotesChange?.(newNotes);
  };

  const toggleCategoryExpansion = (categoryValue: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryValue)) {
        newSet.delete(categoryValue);
      } else {
        newSet.add(categoryValue);
      }
      return newSet;
    });
  };



  const handleCheckboxChange = (categoryValue: string) => {
    if (isPlaceholder) return;
    
    const newSelectedLabels = displayedSelectedLabels.includes(categoryValue)
      ? displayedSelectedLabels.filter(label => label !== categoryValue)
      : [...displayedSelectedLabels, categoryValue];
    
    onLabelsChange(newSelectedLabels);
  };

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <h3 className={styles.sectionTitle}>Error Categories</h3>

        {/* Quick add input */}
        {!isPlaceholder && !isDisabled && (
          <div className={styles.quickAddInput}>
            <input
              type="text"
              value={customCategoryInput}
              onChange={(e) => setCustomCategoryInput(e.target.value)}
              placeholder="Add new category..."
              className={styles.addInput}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
            />
            <button
              type="button"
              onClick={handleAddCustomCategory}
              className={styles.quickAddButton}
              disabled={!customCategoryInput.trim()}
            >
              +
            </button>
          </div>
        )}

        {/* Scrollable checklist */}
        <div className={styles.checklistContainer}>
          {allCategories.map(category => (
            <div key={category.value} className={styles.checklistItem}>
              <div className={styles.checklistRow}>
                <input
                  type="checkbox"
                  checked={displayedSelectedLabels.includes(category.value)}
                  onChange={() => handleCheckboxChange(category.value)}
                  disabled={isDisabled || isPlaceholder}
                  className={styles.checkbox}
                />
                <span className={styles.checklistLabel}>{category.label}</span>
                {displayedSelectedLabels.includes(category.value) && !isPlaceholder && !isDisabled && (
                  <button
                    type="button"
                    onClick={() => toggleCategoryExpansion(category.value)}
                    className={styles.noteButton}
                    title="Add note for this category"
                  >
                    {expandedCategories.has(category.value) ? '📝' : '💬'}
                  </button>
                )}
              </div>
              {expandedCategories.has(category.value) && displayedSelectedLabels.includes(category.value) && (
                <textarea
                  value={categoryNotes[category.value] || ''}
                  onChange={(e) => handleCategoryNoteChange(category.value, e.target.value)}
                  placeholder={`Add specific notes about ${category.label}...`}
                  className={styles.inlineNote}
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorCategoriesBox; 