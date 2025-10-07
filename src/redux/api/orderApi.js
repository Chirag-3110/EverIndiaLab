import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrder: builder.query({
      query: () => "admin/orders-list",
      providesTags: ["Order"],
    }),
  }),
});

export const { useGetOrderQuery } = orderApi;
