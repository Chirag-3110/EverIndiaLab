import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const StaffApi = createApi({
  reducerPath: "StaffApi",
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
  tagTypes: ["Staff"],

  endpoints: (builder) => ({
    // Add Staff
    addStaff: builder.mutation({
      query: (StaffData) => ({
        url: "user/app/add-new-Staff",
        method: "POST",
        body: StaffData,
      }),
      invalidatesTags: ["Staff"],
    }),

    // Get All Staffs
    getStaffs: builder.query<any, String>({
      query: (searchText) => `lab/list-lab-users?search=${searchText}`,
      providesTags: ["Staff"],
    }),

    // Delete Staff
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `user/app/delete-user/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["Staff"],
    }),

    // Update/Edit Staff
    editStaff: builder.mutation({
      query: ({ id, formData }) => ({
        url: `user/app/update-user/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Staff"],
    }),

    // Update Staff Status (block/unblock)
    updateStaffStatus: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `user/app/update-user-status/${id}`,
        method: "PUT",
        body: formdata,
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useAddStaffMutation,
  useGetStaffsQuery,
  useDeleteStaffMutation,
  useEditStaffMutation,
  useUpdateStaffStatusMutation,
} = StaffApi;
