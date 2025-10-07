import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  tagTypes: ["Vendor"],
  endpoints: (builder) => ({
    // Create Vendor
    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: "admin/vendor-register",
        method: "POST",
        body: vendorData,
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Edit Vendor
    editVendor: builder.mutation({
      query: ({ id, formData }) => ({
        url: `admin/update-vendor/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Delete Vendor
    deleteVendor: builder.mutation({
      query: ({ id }) => ({
        url: `admin/vendor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Block Vendor
    blockVendor: builder.mutation({
      query: ({ payload }) => ({
        url: `api/user-verify`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Vendor"],
    }),

    // (Optional) Fetch All Vendors
    getVendors: builder.query({
      query: (status) => {
        return status
          ? `admin/vendor-list?status=${status}`
          : `admin/vendor-list`;
      },
      providesTags: ["Vendor"],
    }),
  }),
});

export const {
  useCreateVendorMutation,
  useEditVendorMutation,
  useDeleteVendorMutation,
  useBlockVendorMutation,
  useGetVendorsQuery,
} = vendorApi;
