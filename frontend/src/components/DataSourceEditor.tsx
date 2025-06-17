'use client';

import React, { useState } from 'react';
import { DataSource } from '@/types';
import { validateDataSource } from '@/lib/settings';
import styles from './DataSourceEditor.module.css';

interface DataSourceEditorProps {
  source: DataSource;
  onChange: (source: DataSource) => void;
  templates: Record<string, DataSource>;
  label: string;
}

const DataSourceEditor: React.FC<DataSourceEditorProps> = ({
  source,
  onChange,
  templates,
  label
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const validateAndUpdate = (newSource: DataSource) => {
    const validationErrors = validateDataSource(newSource);
    setErrors(validationErrors);
    onChange(newSource);
  };

  const updateField = (field: string, value: any) => {
    const newSource = { ...source };
    
    if (field.startsWith('config.')) {
      const configField = field.replace('config.', '');
      newSource.config = { ...newSource.config, [configField]: value };
    } else {
      (newSource as any)[field] = value;
    }
    
    validateAndUpdate(newSource);
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      validateAndUpdate({ ...template });
      setShowTemplates(false);
    }
  };

  const addHeader = () => {
    const headers = { ...source.config.headers };
    headers[''] = '';
    updateField('config.headers', headers);
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const headers = { ...source.config.headers };
    if (oldKey !== newKey) {
      delete headers[oldKey];
    }
    if (newKey.trim()) {
      headers[newKey] = value;
    }
    updateField('config.headers', headers);
  };

  const removeHeader = (key: string) => {
    const headers = { ...source.config.headers };
    delete headers[key];
    updateField('config.headers', headers);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>{label}</h4>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className={styles.templateButton}
        >
          {showTemplates ? 'Hide Templates' : 'Use Template'}
        </button>
      </div>

      {showTemplates && (
        <div className={styles.templates}>
          <h5>Choose a template:</h5>
          <div className={styles.templateList}>
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => applyTemplate(key)}
                className={styles.templateItem}
              >
                <strong>{template.name}</strong>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.fields}>
        {/* Basic Info */}
        <div className={styles.field}>
          <label htmlFor={`${label}-name`}>Name</label>
          <input
            id={`${label}-name`}
            type="text"
            value={source.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Data source name"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${label}-description`}>Description</label>
          <textarea
            id={`${label}-description`}
            value={source.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Brief description of this data source"
            className={styles.textarea}
            rows={2}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${label}-type`}>Type</label>
          <select
            id={`${label}-type`}
            value={source.type}
            onChange={(e) => updateField('type', e.target.value)}
            className={styles.select}
          >
            <option value="file">Local File</option>
            <option value="url">URL Endpoint</option>
            <option value="api">API Service</option>
          </select>
        </div>

        {/* Type-specific fields */}
        {source.type === 'file' && (
          <div className={styles.field}>
            <label htmlFor={`${label}-filePath`}>File Path</label>
            <input
              id={`${label}-filePath`}
              type="text"
              value={source.config.filePath || ''}
              onChange={(e) => updateField('config.filePath', e.target.value)}
              placeholder="/data/examples.jsonl"
              className={styles.input}
            />
          </div>
        )}

        {source.type === 'url' && (
          <>
            <div className={styles.field}>
              <label htmlFor={`${label}-url`}>URL</label>
              <input
                id={`${label}-url`}
                type="url"
                value={source.config.url || ''}
                onChange={(e) => updateField('config.url', e.target.value)}
                placeholder="https://api.example.com/data"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${label}-method`}>HTTP Method</label>
              <select
                id={`${label}-method`}
                value={source.config.method || 'GET'}
                onChange={(e) => updateField('config.method', e.target.value)}
                className={styles.select}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </>
        )}

        {source.type === 'api' && (
          <>
            <div className={styles.field}>
              <label htmlFor={`${label}-endpoint`}>API Endpoint</label>
              <input
                id={`${label}-endpoint`}
                type="url"
                value={source.config.endpoint || ''}
                onChange={(e) => updateField('config.endpoint', e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${label}-apiKey`}>API Key</label>
              <input
                id={`${label}-apiKey`}
                type="password"
                value={source.config.apiKey || ''}
                onChange={(e) => updateField('config.apiKey', e.target.value)}
                placeholder="Your API key"
                className={styles.input}
              />
            </div>
          </>
        )}

        {/* Common fields */}
        <div className={styles.field}>
          <label htmlFor={`${label}-format`}>Data Format</label>
          <select
            id={`${label}-format`}
            value={source.config.format || 'jsonl'}
            onChange={(e) => updateField('config.format', e.target.value)}
            className={styles.select}
          >
            <option value="jsonl">JSONL</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        {/* Headers */}
        {(source.type === 'url' || source.type === 'api') && (
          <div className={styles.field}>
            <label>HTTP Headers</label>
            <div className={styles.headers}>
              {Object.entries(source.config.headers || {}).map(([key, value]) => (
                <div key={key} className={styles.headerRow}>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value)}
                    placeholder="Header name"
                    className={styles.headerKey}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Header value"
                    className={styles.headerValue}
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className={styles.removeHeader}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHeader}
                className={styles.addHeader}
              >
                Add Header
              </button>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor={`${label}-refreshInterval`}>Refresh Interval (minutes)</label>
          <input
            id={`${label}-refreshInterval`}
            type="number"
            min="0"
            value={source.config.refreshInterval || 0}
            onChange={(e) => updateField('config.refreshInterval', parseInt(e.target.value) || 0)}
            placeholder="0 (disabled)"
            className={styles.input}
          />
          <p className={styles.hint}>Set to 0 to disable automatic refresh</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className={styles.errors}>
          <h5>Validation Errors:</h5>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataSourceEditor; 