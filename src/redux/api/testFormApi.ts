import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const testFormApi = createApi({
  reducerPath: "testFormApi",
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
  tagTypes: ["testForm"],
  endpoints: (builder) => ({
    // ✅ Add New testForm Page
    addtestForm: builder.mutation({
      query: (body) => ({
        url: "test-forms/add-new-testform",
        method: "POST",
        body,
      }),
      invalidatesTags: ["testForm"],
    }),

    // ✅ Get testForm Page by slug
    gettestForm: builder.query({
      query: () => ({
        url: `test-forms/list-all-testforms`,
        method: "GET",
      }),
      providesTags: ["testForm"],
    }),
    // ✅ Get testForm details
    gettestFormDetails: builder.query({
      query: (id) => ({
        url: `test-forms/testform-details/${id}`,
        method: "GET",
      }),
      providesTags: ["testForm"],
    }),

    // ✅ Update testForm Page by ID
    updatetestForm: builder.mutation({
      query: ({ id, body }) => ({
        url: `test-forms/update-testform/${id}`,
        method: "PUT",
        body, // {title, content, privacy?}
      }),
      invalidatesTags: ["testForm"],
    }),

    // ✅ Delete testForm Page by ID
    deletetestForm: builder.mutation({
      query: (id) => ({
        url: `test-forms/delete-testform/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["testForm"],
    }),
  }),
});

export const {
  useAddtestFormMutation,
  useGettestFormQuery,
  useGettestFormDetailsQuery,
  useUpdatetestFormMutation,
  useDeletetestFormMutation,
} = testFormApi;
