import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Category", "SubCategory"],
  endpoints: (builder) => ({
    // ---------- PRODUCT MAIN CATEGORY ----------
    getCategoryList: builder.query({
      query: () => "category/get-all-categories",
      providesTags: ["Category"],
    }),

    getlabDetails: builder.query({
      query: () => "lab/get-lab-details",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: "lab/add-update-lab-category",
        method: "PUT",
        body: newCategory,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: (updatedData) => ({
        url: `lab/add-update-lab-category`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `category/delete-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // Update User Status (block/unblock)
    updateCategoryStatus: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `category/update-category-status/${id}`,
        method: "PUT",
        body: formdata,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  // Product Main Category
  useGetCategoryListQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation,
  useGetlabDetailsQuery,
} = categoryApi;
