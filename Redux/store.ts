import { configureStore } from "@reduxjs/toolkit";
import { adminChatApi } from "./adminChatApi";
import { chatApi } from "./chatApi";
import { landingApi } from "./api";

export const makeStore = () => configureStore({
  reducer: {
    [landingApi.reducerPath]: landingApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [adminChatApi.reducerPath]: adminChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(landingApi.middleware, chatApi.middleware, adminChatApi.middleware),
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
