'use client';

import React, { useState } from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { DataSource } from '@/types';
import { dataSourceTemplates, validateSettings, validateDataSource } from '@/lib/settings';
import DataSourceEditor from './DataSourceEditor';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'dataSources' | 'general' | 'advanced'>('dataSources');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validateAndSave = () => {
    const validationErrors = validateSettings(settings);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      // Auto-fix invalid API data sources by resetting them to defaults
      const hasPromptSourceError = validationErrors.some(error => 
        error.includes('Prompt source') && error.includes('Endpoint is required')
      );
      const hasResponseSourceError = validationErrors.some(error => 
        error.includes('Response source') && error.includes('Endpoint is required')
      );
      
      if (hasPromptSourceError || hasResponseSourceError) {
        const updatedSettings = { ...settings };
        if (hasPromptSourceError) {
          updatedSettings.promptSource = {
            type: 'file',
            name: 'Local Examples File',
            description: 'Load prompts from local examples.jsonl file',
            config: {
              filePath: '/data/examples.jsonl',
              format: 'jsonl'
            }
          };
        }
        if (hasResponseSourceError) {
          updatedSettings.responseSource = {
            type: 'file',
            name: 'Local Examples File',
            description: 'Load responses from local examples.jsonl file',
            config: {
              filePath: '/data/examples.jsonl',
              format: 'jsonl'
            }
          };
        }
        updateSettings(updatedSettings);
        setSuccessMessage('Invalid data sources were reset to defaults');
        setTimeout(() => setSuccessMessage(''), 3000);
        setErrors([]);
      }
    }
  };

  const handlePromptSourceChange = (source: DataSource) => {
    updateSettings({ promptSource: source });
    setErrors([]); // Clear errors when making changes
  };

  const handleResponseSourceChange = (source: DataSource) => {
    updateSettings({ responseSource: source });
    setErrors([]);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      resetSettings();
      setErrors([]);
      setSuccessMessage('Settings reset to defaults');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Configure data sources and application preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'dataSources' ? styles.active : ''}`}
          onClick={() => setActiveTab('dataSources')}
        >
          Data Sources
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'advanced' ? styles.active : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'dataSources' && (
          <div className={styles.tabPanel}>
            <h2>Data Sources Configuration</h2>
            <p className={styles.description}>
              Configure where the application gets prompts and responses from. You can use local files, 
              external APIs, or custom URLs.
            </p>

            <div className={styles.sourceSection}>
              <h3>Prompt Source</h3>
              <p>Where should prompts be loaded from?</p>
              <DataSourceEditor
                source={settings.promptSource}
                onChange={handlePromptSourceChange}
                templates={dataSourceTemplates}
                label="Prompt Source"
              />
            </div>

            <div className={styles.sourceSection}>
              <h3>Response Source</h3>
              <p>Where should responses be loaded from?</p>
              <DataSourceEditor
                source={settings.responseSource}
                onChange={handleResponseSourceChange}
                templates={dataSourceTemplates}
                label="Response Source"
              />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className={styles.tabPanel}>
            <h2>General Settings</h2>
            
            <div className={styles.setting}>
              <label htmlFor="apiBaseUrl">API Base URL</label>
              <input
                id="apiBaseUrl"
                type="text"
                value={settings.apiBaseUrl}
                onChange={(e) => updateSettings({ apiBaseUrl: e.target.value })}
                placeholder="http://localhost:9847"
                className={styles.input}
              />
              <p className={styles.hint}>The base URL for the backend API</p>
            </div>

            <div className={styles.setting}>
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                className={styles.select}
              >
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className={styles.hint}>Choose your preferred color theme</p>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => updateSettings({ autoRefresh: e.target.checked })}
                  className={styles.checkbox}
                />
                Auto-refresh data
              </label>
              <p className={styles.hint}>Automatically refresh data from sources periodically</p>
            </div>

            {settings.autoRefresh && (
              <div className={styles.setting}>
                <label htmlFor="refreshInterval">Refresh Interval (minutes)</label>
                <input
                  id="refreshInterval"
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.refreshInterval}
                  onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) || 30 })}
                  className={styles.input}
                />
                <p className={styles.hint}>How often to refresh data (1-1440 minutes)</p>
              </div>
            )}

            <div className={styles.setting}>
              <h3>LLM Integration</h3>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.llm.enabled}
                  onChange={(e) => updateSettings({ 
                    llm: { ...settings.llm, enabled: e.target.checked }
                  })}
                  className={styles.checkbox}
                />
                Enable LLM Integration
              </label>
              <p className={styles.hint}>Connect to Ollama or LM Studio for generating examples</p>
            </div>

            {settings.llm.enabled && (
              <>
                <div className={styles.setting}>
                  <label htmlFor="llmProvider">LLM Provider</label>
                  <select
                    id="llmProvider"
                    value={settings.llm.provider}
                    onChange={(e) => {
                      const provider = e.target.value as 'ollama' | 'lmstudio';
                      const defaultConfig = provider === 'ollama' 
                        ? { baseUrl: 'http://localhost:11434', model: 'llama2' }
                        : { baseUrl: 'http://127.0.0.1:1234', model: 'gemma-3-1b-it-qat' };
                      
                      updateSettings({ 
                        llm: { 
                          ...settings.llm, 
                          provider,
                          ...defaultConfig
                        }
                      });
                    }}
                    className={styles.select}
                  >
                    <option value="lmstudio">LM Studio</option>
                    <option value="ollama">Ollama</option>
                  </select>
                  <p className={styles.hint}>
                    Choose your local LLM provider. 
                    Ollama (port 11434) or LM Studio (port 1234).
                  </p>
                </div>

                <div className={styles.setting}>
                  <label htmlFor="llmBaseUrl">LLM Base URL</label>
                  <input
                    id="llmBaseUrl"
                    type="text"
                    value={settings.llm.baseUrl}
                    onChange={(e) => updateSettings({ 
                      llm: { ...settings.llm, baseUrl: e.target.value }
                    })}
                    placeholder="http://127.0.0.1:1234"
                    className={styles.input}
                  />
                  <p className={styles.hint}>
                    Base URL for your {settings.llm.provider} server 
                    ({settings.llm.provider === 'ollama' ? 'Ollama default: http://localhost:11434' : 'LM Studio default: http://127.0.0.1:1234'})
                  </p>
                </div>

                <div className={styles.setting}>
                  <label htmlFor="llmModel">Model Name</label>
                  <input
                    id="llmModel"
                    type="text"
                    value={settings.llm.model}
                    onChange={(e) => updateSettings({ 
                      llm: { ...settings.llm, model: e.target.value }
                    })}
                    placeholder="gemma-3-1b-it-qat"
                    className={styles.input}
                  />
                  <p className={styles.hint}>
                    Name of the model loaded in {settings.llm.provider}
                    {settings.llm.provider === 'ollama' ? ' (e.g., llama2, codellama)' : ' (as shown in LM Studio)'}
                  </p>
                </div>

                <div className={styles.setting}>
                  <label htmlFor="llmApiKey">API Key (Optional)</label>
                  <input
                    id="llmApiKey"
                    type="password"
                    value={settings.llm.apiKey || ''}
                    onChange={(e) => updateSettings({ 
                      llm: { ...settings.llm, apiKey: e.target.value || undefined }
                    })}
                    placeholder="Leave empty for local LM Studio"
                    className={styles.input}
                  />
                  <p className={styles.hint}>API key if required (not needed for local LM Studio)</p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className={styles.tabPanel}>
            <h2>Advanced Settings</h2>
            
            <div className={styles.setting}>
              <h3>Export Settings</h3>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'llm-notator-settings.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className={styles.button}
              >
                Export Settings
              </button>
              <p className={styles.hint}>Export your current settings to a JSON file</p>
            </div>

            <div className={styles.setting}>
              <h3>Import Settings</h3>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const importedSettings = JSON.parse(event.target?.result as string);
                        updateSettings(importedSettings);
                        setSuccessMessage('Settings imported successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      } catch (error) {
                        setErrors(['Invalid settings file format']);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className={styles.input}
              />
              <p className={styles.hint}>Import settings from a previously exported JSON file</p>
            </div>

            <div className={styles.setting}>
              <h3>Reset Settings</h3>
              <button onClick={handleReset} className={`${styles.button} ${styles.danger}`}>
                Reset to Defaults
              </button>
              <p className={styles.hint}>Reset all settings to their default values</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {errors.length > 0 && (
        <div className={styles.errors}>
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          {errors.some(error => error.includes('Endpoint is required')) && (
            <button 
              onClick={() => {
                updateSettings({
                  promptSource: {
                    type: 'file',
                    name: 'Local Examples File',
                    description: 'Load prompts from local examples.jsonl file',
                    config: {
                      filePath: '/data/examples.jsonl',
                      format: 'jsonl'
                    }
                  },
                  responseSource: {
                    type: 'file',
                    name: 'Local Examples File',
                    description: 'Load responses from local examples.jsonl file',
                    config: {
                      filePath: '/data/examples.jsonl',
                      format: 'jsonl'
                    }
                  }
                });
                setErrors([]);
                setSuccessMessage('Data sources reset to defaults');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
              className={`${styles.button} ${styles.primary}`}
              style={{ marginTop: '0.5rem' }}
            >
              🔧 Fix Data Sources
            </button>
          )}
        </div>
      )}

      {successMessage && (
        <div className={styles.success}>
          {successMessage}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={validateAndSave} className={`${styles.button} ${styles.primary}`}>
          Save Settings
        </button>
        <button onClick={handleReset} className={`${styles.button} ${styles.secondary}`}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings; 