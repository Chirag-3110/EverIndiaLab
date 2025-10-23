import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const packageApi = createApi({
  reducerPath: "packageApi",
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
  tagTypes: ["package"],
  endpoints: (builder) => ({
    // ✅ Assign Admin package
    addpackage: builder.mutation({
      query: (body) => ({
        url: "packages/add-new-package",
        method: "POST",
        body,
      }),
      invalidatesTags: ["package"],
    }),
    // ✅ Assign Admin package
    assignpackage: builder.mutation({
      query: (body) => ({
        url: "packages/assign-lab",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["package"],
    }),

    // ✅ Get Admin package
    getActiveAdminPackage: builder.query({
      query: ({ searchText = "", page = 1, pageSize = 10 }) => ({
        url: `packages/list-lab-packages?search=${searchText}&page=${page}&limit=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["package"],
    }),

    // ✅ Get package
    getpackage: builder.query({
      query: ({ searchText = "", page = 1, pageSize = 10 }) => ({
        url: `packages/list-all-packages?search=${searchText}&page=${page}&limit=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["package"],
    }),
    // ✅ Get Active package
    getActivePackage: builder.query({
      query: ({ searchText = "", page = 1, pageSize = 10 }) => ({
        url: `packages/list-active-packages?search=${searchText}&page=${page}&limit=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["package"],
    }),

    // ✅ Get package details
    getpackageDetails: builder.query({
      query: (id) => ({
        url: `packages/package-details/${id}`,
        method: "GET",
      }),
      providesTags: ["package"],
    }),

    // ✅ Update package  by ID
    updatepackage: builder.mutation({
      query: ({ id, body }) => ({
        url: `packages/update-package/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["package"],
    }),
    // ✅ Update package Status  by ID
    updatePackageStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `packages/change-package-status/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["package"],
    }),

    // ✅ Delete package  by ID
    deletepackage: builder.mutation({
      query: (id) => ({
        url: `packages/delete-package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["package"],
    }),

    // Unassigned package
    unassignedPackage: builder.mutation({
      query: (payload) => ({
        url: "packages/unassign-lab",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["package"],
    }),
  }),
});

export const {
  useAssignpackageMutation,
  useAddpackageMutation,
  useGetpackageQuery,
  useGetActivePackageQuery,
  useGetpackageDetailsQuery,
  useUpdatepackageMutation,
  useDeletepackageMutation,
  useUpdatePackageStatusMutation,
  useGetActiveAdminPackageQuery,
  useUnassignedPackageMutation,
} = packageApi;
