import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const drApi = createApi({
  reducerPath: "drApi",
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
  tagTypes: ["dr"],
  endpoints: (builder) => ({
    // ✅ Add New dr
    adddr: builder.mutation({
      query: (body) => ({
        url: "doctor/add-new-doctor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["dr"],
    }),

    // ✅ Get dr
    getdr: builder.query({
      query: () => ({
        url: `doctor/get-all-doctors`,
        method: "GET",
      }),
      providesTags: ["dr"],
    }),
    // ✅ Get dr details
    getdrDetails: builder.query({
      query: (id) => ({
        url: `doctor/get-doctor-and-booking/${id}`,
        method: "GET",
      }),
      providesTags: ["dr"],
    }),

    // ✅ Update dr Page by ID
    updatedr: builder.mutation({
      query: ({ body }) => ({
        url: `doctor/edit-doctor`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["dr"],
    }),

    // ✅ Delete dr
    deletedr: builder.mutation({
      query: (id) => ({
        url: `doctor/remove-doctor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["dr"],
    }),
  }),
});

export const {
  useAdddrMutation,
  useGetdrQuery,
  useUpdatedrMutation,
  useDeletedrMutation,
  useGetdrDetailsQuery,
} = drApi;
