import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const socialMediaApi = createApi({
  reducerPath: "socialMediaApi",
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
  tagTypes: ["socialMedia"],

  endpoints: (builder) => ({
    // Get All socialMedias
    getsocialMedias: builder.query<any, void>({
      query: () => `global-setting/get-global-setting`,
      providesTags: ["socialMedia"],
    }),

    // Update/Edit socialMedia
    editsocialMedia: builder.mutation({
      query: ({ formData }) => ({
        url: `global-setting/update-global-setting`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["socialMedia"],
    }),
  }),
});

export const { useGetsocialMediasQuery, useEditsocialMediaMutation } =
  socialMediaApi;
