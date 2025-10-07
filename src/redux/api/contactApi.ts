import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const contactApi = createApi({
  reducerPath: "contactApi",
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
  tagTypes: ["contact"],
  endpoints: (builder) => ({
    // ✅ Get contact Page by slug
    getcontact: builder.query({
      query: () => ({
        url: `contact-us/list-inquiry`,
        method: "GET",
      }),
      providesTags: ["contact"],
    }),

    // ✅ Update contact Page by ID
    updatecontact: builder.mutation({
      query: ({ id, body }) => ({
        url: `contact-us/update-contact/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["contact"],
    }),
  }),
});

export const { useGetcontactQuery, useUpdatecontactMutation } = contactApi;
