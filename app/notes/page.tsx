import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import { fetchNotes } from '@/lib/api';

import NotesClient from './Notes.client';

interface NotesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function parseSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const resolvedSearchParams = searchParams ?? {};

  const rawPage = parseSearchParam(resolvedSearchParams.page);
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const search = parseSearchParam(resolvedSearchParams.search) ?? '';

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', search, page],
    queryFn: () =>
      fetchNotes({
        search: search || undefined,
        page,
        perPage: 12,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient initialPage={page} initialSearch={search} />
    </HydrationBoundary>
  );
}
