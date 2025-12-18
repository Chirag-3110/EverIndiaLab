import { configureStore } from "@reduxjs/toolkit";
import { categoryApi } from "../api/categoryApi";
import { profileApi } from "../api/profileApi";
import { testFormApi } from "../api/testFormApi";
import { StaffApi } from "../api/staffApi";
import { packageApi } from "../api/packageApi";
import { bookingApi } from "../api/bookingApi";
import { notificationApi } from "../api/notificationApi";
import { dashboardApi } from "../api/dasboardApi";
import { masterPanelApi } from "../api/masterPanelApi";
import { ticketApi } from "../api/ticketApi";
import { labEmployeeApi } from "../api/labEmployeeApi";
import { accessPermissionApi } from "../api/accessPermissionApi";
import { manualApi } from "../api/manualApi";
import { couponApi } from "../api/couponApi";

export const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [StaffApi.reducerPath]: StaffApi.reducer,
    [testFormApi.reducerPath]: testFormApi.reducer,
    [packageApi.reducerPath]: packageApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [masterPanelApi.reducerPath]: masterPanelApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [labEmployeeApi.reducerPath]: labEmployeeApi.reducer,
    [accessPermissionApi.reducerPath]: accessPermissionApi.reducer,
    [manualApi.reducerPath]: manualApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      categoryApi.middleware,
      profileApi.middleware,
      testFormApi.middleware,
      StaffApi.middleware,
      packageApi.middleware,
      notificationApi.middleware,
      dashboardApi.middleware,
      masterPanelApi.middleware,
      bookingApi.middleware,
      ticketApi.middleware,
      labEmployeeApi.middleware,
      accessPermissionApi.middleware,
      manualApi.middleware,
      couponApi.middleware,
    ]),
});
