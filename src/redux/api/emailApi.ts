import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const emailApi = createApi({
  reducerPath: "emailApi",
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
  tagTypes: ["email"],
  endpoints: (builder) => ({
    // ✅ Add New email Page
    addemail: builder.mutation({
      query: (body) => ({
        url: "lab/add-new-lab",
        method: "POST",
        body,
      }),
      invalidatesTags: ["email"],
    }),

    // ✅ Get email Page by slug
    getemail: builder.query({
      query: () => ({
        url: `email-logs/get-all-email-logs`,
        method: "GET",
      }),
      providesTags: ["email"],
    }),
    // ✅ Get email details
    getemailDetails: builder.query({
      query: (id) => ({
        url: `lab/lab-details/${id}`,
        method: "GET",
      }),
      providesTags: ["email"],
    }),

    // ✅ Update email Page by ID
    updateemail: builder.mutation({
      query: ({ id, body }) => ({
        url: `lab/update-lab/${id}`,
        method: "PUT",
        body, // {title, content, privacy?}
      }),
      invalidatesTags: ["email"],
    }),

    // ✅ Delete email Page by ID
    deleteemail: builder.mutation({
      query: (id) => ({
        url: `lab/delete-lab/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["email"],
    }),
  }),
});

export const {
  useAddemailMutation,
  useGetemailQuery,
  useGetemailDetailsQuery,
  useUpdateemailMutation,
  useDeleteemailMutation,
} = emailApi;
