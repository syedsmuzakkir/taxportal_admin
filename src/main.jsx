// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';

// import './utils/fetchInterceptor.js'
// import { ToastContainer } from "react-toastify";

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );


// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';

// import './utils/fetchInterceptor.js';
// import { ToastContainer } from "react-toastify";

// // 🔑 React Query Imports
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { persistQueryClient } from '@tanstack/react-query-persist-client';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// // ⚡ Create Query Client
// const queryClient = new QueryClient();
// const persister = createSyncStoragePersister({ storage: window.localStorage });

// // ⚡ Persisted cache (1 hour)
// persistQueryClient({
//   queryClient,
//   persister,
//   maxAge: 1000 * 60 * 60,
// });

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <App />
//       <ToastContainer />
//     </QueryClientProvider>
//   </StrictMode>
// );


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import './utils/fetchInterceptor.js';
import { ToastContainer } from "react-toastify";

// 🔑 React Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ⚡ Create Query Client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,    // 10 minutes fresh
      gcTime: 1000 * 60 * 60,       // 1 hour cache time (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,         // Change to true for better UX
      retry: 1,
    },
  },
});

// ⚡ Persist cache in localStorage
const persister = createSyncStoragePersister({ 
  storage: window.localStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60, // 1 hour
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);