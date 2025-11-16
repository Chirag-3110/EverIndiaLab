// reports / dashboard;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("l_t_K");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getdashboard: builder.query({
      query: () => ({
        url: `reports/dashboard`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
  }),
});

export const { useGetdashboardQuery } = dashboardApi;
