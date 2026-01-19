'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { fetchNotes } from '@/lib/api';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import NoteList from '@/components/NoteList/NoteList';
import Loading from '@/components/Loading/Loading';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';

import css from './App.module.css';

interface NotesClientProps {
  initialPage: number;
  initialSearch: string;
}

export default function NotesClient({ initialPage, initialSearch }: NotesClientProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', debouncedSearch, page],
    queryFn: () =>
      fetchNotes({
        search: debouncedSearch || undefined,
        page,
        perPage: 12,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load notes');
    }
  }, [error]);

  const notes = data?.notes ?? [];

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination pageCount={data.totalPages} currentPage={page} onPageChange={setPage} />
        )}
        <button type="button" className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      <div className={css.content}>
        {isLoading ? (
          <Loading />
        ) : notes.length === 0 ? (
          <p className={css.empty}>No notes found.</p>
        ) : (
          <NoteList notes={notes} />
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
