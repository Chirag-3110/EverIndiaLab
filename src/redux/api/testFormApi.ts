import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const testFormApi = createApi({
  reducerPath: "testFormApi",
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
  tagTypes: ["testForm"],
  endpoints: (builder) => ({
    // ✅ Add New testForm Page
    addtestForm: builder.mutation({
      query: (body) => ({
        url: "test-forms/assign-lab",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["testForm"],
    }),

    // ✅ Get Asigned testForm  slug
    gettestForm: builder.query({
      query: ({ searchText = "", page, pageSize }) => ({
        url: `test-forms/list-all-testforms?search=${searchText}&page=${page}&limit=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["testForm"],
    }),
    // ✅ Get testForm Page by slug
    getAdminTestForm: builder.query({
      query: ({ searchText = "", page, pageSize }) => ({
        url: `test-forms/list-lab-testforms?search=${searchText}&page=${page}&limit=${pageSize}`,
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

    // Unassigned test form
    unassignedTestform: builder.mutation({
      query: (payload) => ({
        url: "test-forms/unassign-lab",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["testForm"],
    }),
  }),
});

export const {
  useAddtestFormMutation,
  useGettestFormQuery,
  useGetAdminTestFormQuery,
  useGettestFormDetailsQuery,
  useUpdatetestFormMutation,
  useDeletetestFormMutation,
  useUnassignedTestformMutation,
} = testFormApi;
