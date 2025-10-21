import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const faqApi = createApi({
  reducerPath: "faqApi",
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
  tagTypes: ["faq"],
  endpoints: (builder) => ({
    // ✅ Add New faq
    addfaq: builder.mutation({
      query: (body) => ({
        url: "app/add-faq",
        method: "POST",
        body,
      }),
      invalidatesTags: ["faq"],
    }),

    // ✅ Get faq
    getfaq: builder.query({
      query: () => ({
        url: `app/get-all-faqs`,
        method: "GET",
      }),
      providesTags: ["faq"],
    }),
    // ✅ Get all active faq
    getAllActivefaq: builder.query({
      query: () => ({
        url: `app/get-all-active-faqs`,
        method: "GET",
      }),
      providesTags: ["faq"],
    }),

    // ✅ Update faq Page by ID
    updatefaq: builder.mutation({
      query: ({ body }) => ({
        url: `/app/update-faq`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["faq"],
    }),

    // ✅ Delete faq
    deletefaq: builder.mutation({
      query: (id) => ({
        url: `app/delete-faq//${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["faq"],
    }),

    // ✅ Change status of faq
    updatefaqStatus: builder.mutation({
      query: ({ body }) => ({
        url: `app/change-status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["faq"],
    }),
  }),
});

export const {
  useAddfaqMutation,
  useGetfaqQuery,
  useUpdatefaqMutation,
  useDeletefaqMutation,
  useGetAllActivefaqQuery,
  useUpdatefaqStatusMutation,
} = faqApi;
