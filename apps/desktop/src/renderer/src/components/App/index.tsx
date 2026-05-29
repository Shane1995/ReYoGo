import { Router } from '@main/lib/electron-router-dom';
import AppLoader from '../AppLoader';
import { Route } from 'react-router-dom';
import { Toaster } from '@reyogo/ui';
import { AppConfigProvider } from '@/Context';
import { EntityProvider } from '@/Context/EntityContext';

const App = () => {
  return (
    <AppConfigProvider>
      <EntityProvider>
        <Router
          _providerProps={{ future: { v7_startTransition: true } }}
          main={<Route path="*" element={<AppLoader />} />}
        />
        <Toaster position="bottom-right" />
      </EntityProvider>
    </AppConfigProvider>
  );
};

export default App;
