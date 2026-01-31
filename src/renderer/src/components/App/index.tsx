import { Router } from "@main/lib/electron-router-dom";
import AppLoader from "../AppLoader";
import { Route } from "react-router-dom";

const App = () => {
  return (
    <Router
      _providerProps={{ future: { v7_startTransition: true } }}
      main={
        <Route path="*" element={<AppLoader />} />
      }
    />
  );
};

export default App;