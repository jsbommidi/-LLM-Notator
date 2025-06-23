import React from 'react';
import styles from './AnnotationForm.module.css';

interface NotesBoxProps {
  isPlaceholder?: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  isDisabled?: boolean;
}

const NotesBox: React.FC<NotesBoxProps> = ({
  isPlaceholder = false,
  notes,
  onNotesChange,
  isDisabled = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <h3 className={styles.sectionTitle}>Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={isPlaceholder ? "Notes and comments will go here..." : "Add any additional notes or comments..."}
          className={styles.textarea}
          disabled={isDisabled || isPlaceholder}
        />
      </div>
    </div>
  );
};

export default NotesBox; 