import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // Get All Products
    getProduct: builder.query({
      query: (search = "") => `admin/product-list?category=${search}`,
      providesTags: ["Product"],
    }),

    // Add Single Product
    addSingleProduct: builder.mutation({
      query: (singleProduct) => ({
        url: "admin/product-create",
        method: "POST",
        body: singleProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    // Add Bulk Product
    addBulkProduct: builder.mutation({
      query: (bulkProduct) => ({
        url: "admin/bulk-product-create",
        method: "POST",
        body: bulkProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    // Delete Product
    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `admin/product-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Update Customer Status (block/unblock)
    updateProductStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `admin/product-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Product"],
    }),

    // Update/Edit Product
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `admin/product-update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductQuery,
  useAddSingleProductMutation,
  useAddBulkProductMutation,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useUpdateProductMutation,
} = productApi;
