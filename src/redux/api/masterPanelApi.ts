import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const masterPanelApi = createApi({
  reducerPath: "masterPanelApiApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["masterPanel"],
  endpoints: (builder) => ({
    // ✅ Get masterPanelApi Page by slug
    getmasterPanelApi: builder.query({
      query: (slug) => ({
        url: `global-setting/get-global-setting?slug=${slug}`,
        method: "GET",
      }),
      providesTags: ["masterPanel"],
    }),
    getmethodPanelApi: builder.query({
      query: (slug) => ({
        url: `global-setting/get-global-setting?slug=${slug}`,
        method: "GET",
      }),
      providesTags: ["masterPanel"],
    }),

    // ✅ Update masterPanelApi Page by ID
    updatemasterPanelApi: builder.mutation({
      query: ({ slug, body }) => ({
        url: `global-setting/update-global-setting?slug=${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["masterPanel"],
    }),
  }),
});

export const { useGetmasterPanelApiQuery, useUpdatemasterPanelApiMutation, useGetmethodPanelApiQuery } =
  masterPanelApi;
