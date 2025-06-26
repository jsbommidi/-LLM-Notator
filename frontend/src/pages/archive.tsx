import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { archiveApi, ArchiveItem } from '@/lib/archiveApi';
import styles from '@/styles/Archive.module.css';

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ArchivePage: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadArchives = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = search 
        ? await archiveApi.searchArchives(search, page)
        : await archiveApi.getArchives(page);

      setArchives(response.archives);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading archives:', err);
      setError('Failed to load archives. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadArchives(1);
      return;
    }

    setIsSearching(true);
    await loadArchives(1, searchQuery.trim());
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadArchives(1);
  };

  const handleViewArchive = (archive: ArchiveItem) => {
    setSelectedArchive(archive);
    setShowModal(true);
  };

  const handleDeleteArchive = async (id: number) => {
    if (!confirm('Are you sure you want to delete this archive?')) {
      return;
    }

    try {
      await archiveApi.deleteArchive(id);
      // Reload archives after deletion
      await loadArchives(currentPage, searchQuery || undefined);
    } catch (err) {
      console.error('Error deleting archive:', err);
      alert('Failed to delete archive. Please try again.');
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatErrorCategory = (category: string | null) => {
    return category || 'None';
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading && archives.length === 0) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Archive - LLM Notator</title>
          <meta name="description" content="Archive of annotated LLM responses" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>📚 Archive</h1>
              <Link href="/" className={styles.backButton}>
                ← Back to Annotator
              </Link>
            </div>
          </div>
          
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading archives...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Archive - LLM Notator</title>
        <meta name="description" content="Archive of annotated LLM responses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>📚 Archive</h1>
            <Link href="/" className={styles.backButton}>
              ← Back to Annotator
            </Link>
          </div>
        </div>

        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archives..."
              className={styles.searchInput}
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className={styles.searchButton}
            >
              {isSearching ? '⏳' : '🔍'} Search
            </button>
            {searchQuery && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className={styles.clearButton}
              >
                ✕ Clear
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
            <button onClick={() => loadArchives(currentPage)} className={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {archives.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <h2>No archives found</h2>
            <p>
              {searchQuery 
                ? `No archives match your search for "${searchQuery}"`
                : 'No archived annotations yet. Create some annotations to see them here!'
              }
            </p>
          </div>
        ) : (
          <>
            <div className={styles.archiveList}>
              {archives.map((archive) => (
                <div key={archive.id} className={styles.archiveCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.archiveId}>#{archive.id}</span>
                    <span className={styles.archiveDate}>
                      {formatDate(archive.created_at)}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.promptSection}>
                      <strong>Prompt:</strong>
                      <p>{truncateText(archive.prompt)}</p>
                    </div>

                    <div className={styles.responseSection}>
                      <strong>Response:</strong>
                      <p>{truncateText(archive.response)}</p>
                    </div>

                    <div className={styles.metaSection}>
                      <div className={styles.categories}>
                        <strong>Category:</strong> {formatErrorCategory(archive.error_category)}
                      </div>
                      {archive.notes && (
                        <div className={styles.notes}>
                          <strong>Notes:</strong> {truncateText(archive.notes, 50)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => handleViewArchive(archive)}
                      className={styles.viewButton}
                    >
                      👁️ View Details
                    </button>
                    <button 
                      onClick={() => handleDeleteArchive(archive.id)}
                      className={styles.deleteButton}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => loadArchives(currentPage - 1, searchQuery || undefined)}
                  disabled={!pagination.hasPrev || isLoading}
                  className={styles.pageButton}
                >
                  ← Previous
                </button>
                
                <span className={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages} 
                  ({pagination.totalItems} total)
                </span>
                
                <button
                  onClick={() => loadArchives(currentPage + 1, searchQuery || undefined)}
                  disabled={!pagination.hasNext || isLoading}
                  className={styles.pageButton}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal for viewing archive details */}
        {showModal && selectedArchive && (
          <div className={styles.modal} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Archive Details #{selectedArchive.id}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className={styles.modalClose}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.detailSection}>
                  <h3>Prompt</h3>
                  <div className={styles.detailContent}>{selectedArchive.prompt}</div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Response</h3>
                  <div className={styles.detailContent}>{selectedArchive.response}</div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Error Category</h3>
                  <div className={styles.detailContent}>
                    {formatErrorCategory(selectedArchive.error_category)}
                  </div>
                </div>

                {selectedArchive.notes && (
                  <div className={styles.detailSection}>
                    <h3>Notes</h3>
                    <div className={styles.detailContent}>{selectedArchive.notes}</div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3>Timestamps</h3>
                  <div className={styles.timestampInfo}>
                    <div><strong>Created:</strong> {formatDate(selectedArchive.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArchivePage; 