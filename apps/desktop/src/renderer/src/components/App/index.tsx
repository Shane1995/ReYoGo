import { Router } from '@main/lib/electron-router-dom';
import AppLoader from '../AppLoader';
import { Route } from 'react-router-dom';
import { Toaster } from '@reyogo/ui';
import { AppConfigProvider } from '@/Context';

const App = () => {
  return (
    <AppConfigProvider>
      <Router
        _providerProps={{ future: { v7_startTransition: true } }}
        main={<Route path="*" element={<AppLoader />} />}
      />
      <Toaster position="bottom-right" />
    </AppConfigProvider>
  );
};

export default App;
