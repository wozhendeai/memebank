import React from 'react'
import ReactDOM from 'react-dom/client'
import {PrivyProvider} from '@privy-io/react-auth';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {baseGoerli, base} from 'viem/chains';

// Pages
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import HomePage from './pages/HomePage/HomePage.tsx';
import CreateAccountPage from './pages/CreateAccountPage/CreateAccountPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <HomePage />
  },
  {
    path: "/create",
    element: <CreateAccountPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="clw5b3jae0fe3358lgosj6b6z"
      config={{
        // Display email and wallet as login methods
        loginMethods: ['wallet'],
        // Customize Privy's appearance in your app
        appearance: {
          walletList: ['coinbase_wallet'], 
          theme: 'light',
          accentColor: '#676FFF',
          logo: '',
        },
        // Create embedded wallets for ALL users
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        externalWallets: { 
          coinbaseWallet: { 
            // Valid connection options include 'eoaOnly' (default), 'smartWalletOnly', or 'all'
            connectionOptions: 'smartWalletOnly', 
          }, 
        },
        supportedChains: [baseGoerli, base]
      }}
    >
      <RouterProvider router={router} />
    </PrivyProvider>
  </React.StrictMode>,
)
