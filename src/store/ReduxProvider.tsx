"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore } from "./store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [{ store, persistor }] = useState(() => makeStore());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
