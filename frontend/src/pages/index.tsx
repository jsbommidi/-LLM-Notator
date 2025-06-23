import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Example, AnnotationRequest } from '@/types';
import { api, ApiError, updateApiBaseUrl } from '@/lib/api';
import { useSettings } from '@/lib/SettingsContext';

import AnnotationForm from '@/components/AnnotationForm';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Home.module.css';
import ExampleDisplay from '@/components/ExampleDisplay';


const Home: React.FC = () => {
  const { settings } = useSettings();
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [examples, setExamples] = useState<Example[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  

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
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>LLM Notator</h1>
                <p className={styles.subtitle}>
                  Review and annotate LLM input-output pairs
                </p>
              </div>
              <Navigation
                onExport={handleExport}
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
                onExport={handleExport}
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
      prompt: 'This is where your prompts will appear. Upload your examples to start annotating.\n\nExample: "What is the capital of France?"',
      response: 'This is where LLM responses will appear for annotation.\n\nExample: "Paris is the capital of France. It is located in the north-central part of the country and is known for its rich history, culture, and landmarks like the Eiffel Tower."'
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
                onExport={handleExport}
                isLoading={isLoading}
              />
            </div>
          </header>

          <div className={styles.content}>
            <ExampleDisplay
              example={placeholderExample}
              currentIndex={0}
              totalCount={0}
              onPrevious={() => {}}
              onNext={() => {}}
              isLoading={false}
            />

            <AnnotationForm
              exampleId="placeholder"
              onSubmit={async () => {}}
              isLoading={false}
            />
          </div>

          <div className={styles.placeholderNote}>
            <p>🎯 This is a placeholder view. Add your examples to start annotating.</p>
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
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>LLM Notator</h1>
              <p className={styles.subtitle}>
                Review and annotate LLM input-output pairs
              </p>
            </div>
            <Navigation
              onExport={handleExport}
              isLoading={isLoading}
            />
          </div>
        </header>

        <div className={styles.content}>
          <ExampleDisplay
            example={currentExample}
            currentIndex={currentIndex}
            totalCount={examples.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isLoading={isLoading}
          />

          <AnnotationForm
            exampleId={currentExample.id}
            onSubmit={handleAnnotationSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Home; 