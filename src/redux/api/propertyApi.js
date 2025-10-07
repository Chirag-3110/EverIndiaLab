import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const propertyApi = createApi({
  reducerPath: "propertyAPi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  tagTypes: ["Property"],
  endpoints: (builder) => ({
    // Get All Properties
    getProperties: builder.query({
      query: (search = "") => `properties`,
      providesTags: ["Property"],
    }),
  }),
});

export const { useGetPropertiesQuery } = propertyApi;
