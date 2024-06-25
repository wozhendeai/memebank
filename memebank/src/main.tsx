import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { config } from './wagmi.ts'

// Pages
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import HomePage from './pages/HomePage/HomePage.tsx';
import { createTheme, ThemeProvider } from '@mui/material';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <HomePage />
  }
]);

const theme = createTheme();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
          </ThemeProvider>
      </QueryClientProvider>
  </WagmiProvider>
  </React.StrictMode >,
)
