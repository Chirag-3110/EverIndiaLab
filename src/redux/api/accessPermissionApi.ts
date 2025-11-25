import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const accessPermissionApi = createApi({
  reducerPath: "accessPermissionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("l_t_K");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["accessPermissionApi"],
  endpoints: (builder) => ({
    getAccessPermission: builder.query({
      query: () => "global-setting/get-global-setting?slug=access_permissions",
      providesTags: ["accessPermissionApi"],
    }),
  }),
});

export const { useGetAccessPermissionQuery } = accessPermissionApi;
