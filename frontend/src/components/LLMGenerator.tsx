import React, { useState } from 'react';
import { Example } from '@/types';
import { createLMStudioService, LLMApiError } from '@/lib/llmApi';
import { useSettings } from '@/lib/SettingsContext';
import styles from './LLMGenerator.module.css';

interface LLMGeneratorProps {
  onExampleGenerated: (example: Example) => void;
}

const LLMGenerator: React.FC<LLMGeneratorProps> = ({
  onExampleGenerated,
}) => {
  const { settings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const llmService = createLMStudioService(settings.llm.model);

  const testConnection = async () => {
    try {
      setError(null);
      const connected = await llmService.testConnection();
      setIsConnected(connected);
      if (!connected) {
        setError('Cannot connect to LM Studio. Make sure it\'s running on http://127.0.0.1:1234');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Failed to test connection to LM Studio');
    }
  };

  const generateExample = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      
      const example = await llmService.generateExample(prompt.trim());
      onExampleGenerated(example);
      setPrompt(''); // Clear prompt after successful generation
    } catch (err) {
      if (err instanceof LLMApiError) {
        setError(err.message);
      } else {
        setError('Failed to generate response from LLM');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateExample();
    }
  };

  if (!settings.llm.enabled) {
    return null; // Don't render if LLM is disabled
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🤖 LLM Generator</h3>
        <div className={styles.status}>
          <button
            onClick={testConnection}
            className={`${styles.statusButton} ${
              isConnected === true ? styles.connected : 
              isConnected === false ? styles.disconnected : styles.unknown
            }`}
            title="Test LM Studio connection"
          >
            {isConnected === true ? '🟢' : 
             isConnected === false ? '🔴' : '⚪'} 
            {settings.llm.model}
          </button>
        </div>
      </div>

      <div className={styles.inputSection}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate an LLM response for annotation..."
          className={styles.promptInput}
          rows={3}
          onKeyPress={handleKeyPress}
          disabled={isGenerating}
        />
        
        <button
          onClick={generateExample}
          disabled={isGenerating || !prompt.trim()}
          className={styles.generateButton}
        >
          {isGenerating ? 'Generating...' : 'Generate Response'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.info}>
        <small>
          💡 This will send your prompt to LM Studio ({settings.llm.baseUrl}) and create a new example for annotation.
        </small>
      </div>
    </div>
  );
};

export default LLMGenerator; 