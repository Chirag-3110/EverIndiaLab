import { configureStore } from "@reduxjs/toolkit";
import { UserApi } from "../api/UserApi";
import { providerApi } from "../api/providerApi";
import { categoryApi } from "../api/categoryApi";
import { profileApi } from "../api/profileApi";
import { cmsApi } from "../api/cmsApi";
import { contactApi } from "../api/contactApi";
import { labsApi } from "../api/labsApi";
import { testFormApi } from "../api/testFormApi";
import { StaffApi } from "../api/staffApi";
import { emailApi } from "../api/emailApi";
import { socialMediaApi } from "../api/socialMediaApi";
import { faqApi } from "../api/faqApi";
import { packageApi } from "../api/packageApi";
import { masterPanelApi } from "../api/masterPanelApi";
import { bookingApi } from "../api/bookingApi";

export const store = configureStore({
  reducer: {
    [cmsApi.reducerPath]: cmsApi.reducer,
    [UserApi.reducerPath]: UserApi.reducer,
    [providerApi.reducerPath]: providerApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [labsApi.reducerPath]: labsApi.reducer,
    [StaffApi.reducerPath]: StaffApi.reducer,
    [testFormApi.reducerPath]: testFormApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [socialMediaApi.reducerPath]: socialMediaApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [packageApi.reducerPath]: packageApi.reducer,
    [masterPanelApi.reducerPath]: masterPanelApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      cmsApi.middleware,
      UserApi.middleware,
      providerApi.middleware,
      categoryApi.middleware,
      profileApi.middleware,
      contactApi.middleware,
      labsApi.middleware,
      testFormApi.middleware,
      StaffApi.middleware,
      emailApi.middleware,
      socialMediaApi.middleware,
      faqApi.middleware,
      packageApi.middleware,
      masterPanelApi.middleware,
      bookingApi.middleware,
    ]),
});
