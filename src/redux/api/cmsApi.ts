import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const cmsApi = createApi({
  reducerPath: "cmsApi",
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
  tagTypes: ["cms"],
  endpoints: (builder) => ({
    // ✅ Add New CMS Page
    addCms: builder.mutation({
      query: (body) => ({
        url: "cms/app/add-new-cms",
        method: "POST",
        body, // {title, slug, content, privacy?}
      }),
      invalidatesTags: ["cms"],
    }),

    // ✅ Get CMS Page by slug
    getCms: builder.query({
      query: ({ slug }) => ({
        url: `cms/app/get-cms-page?slug=${slug}`,
        method: "GET",
      }),
      providesTags: ["cms"],
    }),

    // ✅ Update CMS Page by ID
    updateCms: builder.mutation({
      query: ({ id, body }) => ({
        url: `cms/app/update-cms-page/${id}`,
        method: "PUT",
        body, // {title, content, privacy?}
      }),
      invalidatesTags: ["cms"],
    }),

    // ✅ Delete CMS Page by ID
    deleteCms: builder.mutation({
      query: (id) => ({
        url: `cms/app/delete-cms-page/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cms"],
    }),
  }),
});

export const {
  useAddCmsMutation,
  useGetCmsQuery,
  useUpdateCmsMutation,
  useDeleteCmsMutation,
} = cmsApi;
