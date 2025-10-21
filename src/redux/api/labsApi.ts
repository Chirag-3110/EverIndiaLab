import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const labsApi = createApi({
  reducerPath: "labsApi",
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
  tagTypes: ["labs"],
  endpoints: (builder) => ({
    // ✅ Add New labs Page
    addlabs: builder.mutation({
      query: (body) => ({
        url: "lab/add-new-lab",
        method: "POST",
        body,
      }),
      invalidatesTags: ["labs"],
    }),

    // ✅ Get labs Page by slug
    getlabs: builder.query({
      query: () => ({
        url: `lab/list-all-labs`,
        method: "GET",
      }),
      providesTags: ["labs"],
    }),
    // ✅ Get labs details
    getlabsDetails: builder.query({
      query: (id) => ({
        url: `lab/lab-details/${id}`,
        method: "GET",
      }),
      providesTags: ["labs"],
    }),

    // ✅ Update labs Page by ID
    updatelabs: builder.mutation({
      query: ({ id, body }) => ({
        url: `lab/update-lab/${id}`,
        method: "PUT",
        body, // {title, content, privacy?}
      }),
      invalidatesTags: ["labs"],
    }),

    // ✅ Delete labs Page by ID
    deletelabs: builder.mutation({
      query: (id) => ({
        url: `lab/delete-lab/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["labs"],
    }),
  }),
});

export const {
  useAddlabsMutation,
  useGetlabsQuery,
  useGetlabsDetailsQuery,
  useUpdatelabsMutation,
  useDeletelabsMutation,
} = labsApi;
