import { Router } from "@main/lib/electron-router-dom";
import AppLoader from "../AppLoader";
import { Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

const App = () => {
  return (
    <>
      <Router
        _providerProps={{ future: { v7_startTransition: true } }}
        main={
          <Route path="*" element={<AppLoader />} />
        }
      />
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;