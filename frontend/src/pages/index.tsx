import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Example, AnnotationRequest } from '@/types';
import { api, ApiError, updateApiBaseUrl } from '@/lib/api';
import { useSettings } from '@/lib/SettingsContext';
import ExampleDisplay from '@/components/ExampleDisplay';
import AnnotationForm from '@/components/AnnotationForm';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Home.module.css';

const Home: React.FC = () => {
  const { settings } = useSettings();
  const [examples, setExamples] = useState<Example[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load examples on component mount and when settings change
  useEffect(() => {
    loadExamples();
  }, []);

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

  const loadExamples = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the configured data source for prompts/responses
      const data = await api.getExamples(settings.promptSource);
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

  const handleAnnotationSubmit = async (annotation: AnnotationRequest) => {
    try {
      await api.submitAnnotation(annotation);
      // Optionally move to next example after successful annotation
      if (currentIndex < examples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (err) {
      console.error('Failed to submit annotation:', err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const blob = await api.exportAnnotations();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export annotations:', err);
      if (err instanceof ApiError) {
        alert(`Failed to export annotations: ${err.message}`);
      } else {
        alert('Failed to export annotations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
    return (
      <div className={styles.container}>
        <Head>
          <title>LLM Notator</title>
          <meta name="description" content="Review and annotate LLM responses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.empty}>
            <h1>No Examples Found</h1>
            <p>No examples are available for annotation.</p>
            <button onClick={loadExamples} className={styles.retryButton}>
              Refresh
            </button>
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
          <h1 className={styles.title}>LLM Notator</h1>
          <p className={styles.subtitle}>
            Review and annotate LLM input-output pairs
          </p>
        </header>

        <div className={styles.content}>
          <ExampleDisplay
            example={currentExample}
            currentIndex={currentIndex}
            totalCount={examples.length}
          />

          <AnnotationForm
            exampleId={currentExample.id}
            onSubmit={handleAnnotationSubmit}
            isLoading={isLoading}
          />

          <Navigation
            currentIndex={currentIndex}
            totalCount={examples.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onExport={handleExport}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Home; 