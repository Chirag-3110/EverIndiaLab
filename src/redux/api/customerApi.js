import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Add Customer
    addCustomer: builder.mutation({
      query: (customerData) => ({
        url: "admin/customer-register",
        method: "POST",
        body: customerData,
      }),
      invalidatesTags: ["Customer"],
    }),

    // Get All Customers
    getCustomers: builder.query({
      query: (status) => {
        return status
          ? `admin/customer-list?status=${status}`
          : "admin/customer-list";
      },
      providesTags: ["Customer"],
    }),

    // Delete Customer
    deleteCustomer: builder.mutation({
      query: ({ id }) => ({
        url: `admin/customer-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),

    // Update/Edit Customer
    editCustomer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `admin/customer-update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Customer"],
    }),

    // Update Customer Status (block/unblock)
    updateCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `admin/customer-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useAddCustomerMutation,
  useGetCustomersQuery,
  useDeleteCustomerMutation,
  useEditCustomerMutation,
  useUpdateCustomerStatusMutation,
} = customerApi;
