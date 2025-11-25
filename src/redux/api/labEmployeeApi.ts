import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const labEmployeeApi = createApi({
  reducerPath: "labEmployeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("l_t_K");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["labEmployee"],

  endpoints: (builder) => ({
    // Add labEmployee
    addlabEmployee: builder.mutation({
      query: (body) => ({
        url: "lab-employee/add-new-lab-employee",
        method: "POST",
        body,
      }),
      invalidatesTags: ["labEmployee"],
    }),

    // Delete labEmployee
    deletelabEmployee: builder.mutation({
      query: (id) => ({
        url: `lab-employee/delete-employee/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["labEmployee"],
    }),

    // Update/Edit labEmployee
    editlabEmployee: builder.mutation({
      query: ({ id, formData }) => ({
        url: `lab-employee/update-employee-details/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["labEmployee"],
    }),

    // Get All Assigned labEmployees
    getlabEmployees: builder.query({
      query: ({ id }) => (id ? `lab-employee/get-lab-employee/${id}` : null),
      providesTags: ["labEmployee"],
    }),
  }),
});

export const {
  useGetlabEmployeesQuery,
  useAddlabEmployeeMutation,
  useDeletelabEmployeeMutation,
  useEditlabEmployeeMutation,
} = labEmployeeApi;
