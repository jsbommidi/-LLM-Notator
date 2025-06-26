import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Example, AnnotationRequest } from '@/types';
import { api, ApiError, updateApiBaseUrl } from '@/lib/api';
import { archiveApi, ArchiveApiError } from '@/lib/archiveApi';
import { useSettings } from '@/lib/SettingsContext';

import AnnotationForm from '@/components/AnnotationForm';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Home.module.css';
import ExampleDisplay from '@/components/ExampleDisplay';
import PromptBox from '@/components/PromptBox';
import ResponseBox from '@/components/ResponseBox';
import ErrorCategoriesBox from '@/components/ErrorCategoriesBox';
import NotesBox from '@/components/NotesBox';
import LLMGenerator from '@/components/LLMGenerator';


const Home: React.FC = () => {
  const { settings } = useSettings();
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [examples, setExamples] = useState<Example[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({});
  

  // Load examples on component mount and when settings change
  

  // Update API base URL when settings change
  useEffect(() => {
    updateApiBaseUrl(settings.apiBaseUrl);
  }, [settings.apiBaseUrl]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (settings.autoRefresh && settings.refreshInterval > 0) {
      const intervalMs = settings.refreshInterval * 60 * 1000; // Convert minutes to milliseconds
      const interval = setInterval(() => {
        loadExamples();
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval]);

  

  // Function to load examples
  const loadExamples = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the configured data source for prompts/responses
      const rawData = await api.getExamples(settings.promptSource);
      const data = Array.isArray(rawData) ? rawData : [];
      setExamples(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load examples:', err);
      if (err instanceof ApiError) {
        setError(`Failed to load examples: ${err.message}`);
      } else {
        setError('Failed to load examples. Please check your data source configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load examples on mount and when promptSource changes
  useEffect(() => {
    loadExamples();
  }, [settings.promptSource]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < examples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAnnotationSubmit = async () => {
    if (selectedLabels.length === 0) {
      alert('Please select at least one error category.');
      return;
    }

    try {
      await api.submitAnnotation({
        id: examples[currentIndex].id,
        labels: selectedLabels,
        notes: notes.trim(),
        categoryNotes: categoryNotes,
      });
      
      // Reset form after successful submission
      setSelectedLabels([]);
      setNotes('');
      setCategoryNotes({});
      
      // Optionally move to next example after successful annotation
      if (currentIndex < examples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (err) {
      console.error('Failed to submit annotation:', err);
      alert('Failed to submit annotation. Please try again.');
    }
  };

  const handleArchiveSubmit = async () => {
    if (selectedLabels.length === 0) {
      alert('Please select at least one error category.');
      return;
    }

    try {
      // Save to archive (PostgreSQL database)
      await archiveApi.createArchive({
        prompt: examples[currentIndex].prompt,
        response: examples[currentIndex].response,
        error_categories: selectedLabels,
        notes: notes.trim(),
        category_notes: categoryNotes,
        example_id: examples[currentIndex].id,
      });

      // Also submit to the regular annotation system
      await api.submitAnnotation({
        id: examples[currentIndex].id,
        labels: selectedLabels,
        notes: notes.trim(),
        categoryNotes: categoryNotes,
      });
      
      // Reset form after successful submission
      setSelectedLabels([]);
      setNotes('');
      setCategoryNotes({});
      
      alert('Successfully archived annotation!');
      
      // Optionally move to next example after successful annotation
      if (currentIndex < examples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (err) {
      console.error('Failed to archive annotation:', err);
      if (err instanceof ArchiveApiError) {
        alert(`Failed to archive annotation: ${err.message}`);
      } else {
        alert('Failed to archive annotation. Please try again.');
      }
    }
  };

  const handleExampleGenerated = (newExample: Example) => {
    setExamples(prev => [...prev, newExample]);
    setCurrentIndex(examples.length); // Navigate to the new example
  };



  if (isLoading && examples.length === 0) {
    return (
      <div className={styles.container}>
        <Head>
          <title>LLM Notator</title>
          <meta name="description" content="Review and annotate LLM responses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>LLM Notator</h1>
                <p className={styles.subtitle}>
                  Review and annotate LLM input-output pairs
                </p>
              </div>
              <Navigation
                isLoading={isLoading}
              />
            </div>
          </header>
          <div className={styles.loading}>
            <h1>Loading examples...</h1>
            <div className={styles.spinner}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>LLM Notator - Error</title>
          <meta name="description" content="Review and annotate LLM responses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>LLM Notator</h1>
                <p className={styles.subtitle}>
                  Review and annotate LLM input-output pairs
                </p>
              </div>
              <Navigation
                isLoading={isLoading}
              />
            </div>
          </header>
          <div className={styles.error}>
            <h1>Error</h1>
            <p>{error}</p>
            <button onClick={loadExamples} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (examples.length === 0) {
    // Create placeholder example for display
    const placeholderExample = {
      id: 'placeholder',
      prompt: '',
      response: ''
    };

    return (
      <div className={styles.container}>
        <Head>
          <title>LLM Notator</title>
          <meta name="description" content="Review and annotate LLM responses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>LLM Notator</h1>
                <p className={styles.subtitle}>
                  Review and annotate LLM input-output pairs
                </p>
              </div>
              <Navigation
                isLoading={isLoading}
              />
            </div>
          </header>

          <LLMGenerator onExampleGenerated={handleExampleGenerated} />

          <div className={styles.content}>
            <PromptBox
              example={placeholderExample}
              isPlaceholder={true}
            />
            
            <ResponseBox
              example={placeholderExample}
              isPlaceholder={true}
            />
            
            <ErrorCategoriesBox
              isPlaceholder={true}
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
              categoryNotes={categoryNotes}
              onCategoryNotesChange={setCategoryNotes}
              isDisabled={true}
            />
            
            <NotesBox
              isPlaceholder={true}
              notes={notes}
              onNotesChange={setNotes}
              isDisabled={true}
            />
          </div>
        </main>
      </div>
    );
  }

  const currentExample = examples[currentIndex];

  return (
    <div className={styles.container}>
      <Head>
        <title>LLM Notator</title>
        <meta name="description" content="Review and annotate LLM responses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>LLM Notator</h1>
              <p className={styles.subtitle}>
                Review and annotate LLM input-output pairs
              </p>
            </div>
            <Navigation
              isLoading={isLoading}
            />
          </div>
        </header>

        <LLMGenerator onExampleGenerated={handleExampleGenerated} />

        <div className={styles.content}>
          <PromptBox
            example={currentExample}
            isPlaceholder={false}
          />
          
          <ResponseBox
            example={currentExample}
            isPlaceholder={false}
          />
          
          <ErrorCategoriesBox
            isPlaceholder={false}
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
            categoryNotes={categoryNotes}
            onCategoryNotesChange={setCategoryNotes}
            isDisabled={isLoading}
          />
          
          <NotesBox
            isPlaceholder={false}
            notes={notes}
            onNotesChange={setNotes}
            isDisabled={isLoading}
          />
        </div>
        
        <div className={styles.navigationControls}>
          <div className={styles.navigationInfo}>
            Example {currentIndex + 1} of {examples.length} (ID: {currentExample.id})
          </div>
          <div className={styles.navigationButtons}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isLoading}
              className={`${styles.navButton} ${styles.previousButton}`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === examples.length - 1 || isLoading}
              className={`${styles.navButton} ${styles.nextButton}`}
            >
              Next →
            </button>
            <button
              onClick={handleAnnotationSubmit}
              disabled={isLoading || selectedLabels.length === 0}
              className={styles.submitButton}
            >
              Submit Annotation
            </button>
            <button
              onClick={handleArchiveSubmit}
              disabled={isLoading || selectedLabels.length === 0}
              className={styles.archiveButton}
            >
              📚 Archive
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 