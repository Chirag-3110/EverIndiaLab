// src/redux/api/addressApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Address"],
  endpoints: (builder) => ({
    // Get address list
    getAddressList: builder.query({
      query: (userId) => ({
        url: `address/list/${userId}`,
        method: "GET",
      }),
      providesTags: ["Address"],
    }),

    // Add new address
    addNewAddress: builder.mutation({
      query: (body) => ({
        url: "address/add-new-address",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    // Edit address
    editAddress: builder.mutation({
      query: (body) => ({
        url: "address/edit-address",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    // Delete address
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `address/delete-address/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useGetAddressListQuery,
  useAddNewAddressMutation,
  useEditAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
