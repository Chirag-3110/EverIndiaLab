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

    // Get All Assigned Staffs
    getStaffs: builder.query({
      query: ({searchText, page, pageSize}) =>
        searchText && searchText.trim() !== ""
          ? `lab/list-lab-users?search=${searchText}`
          : `lab/list-lab-users`,
      providesTags: ["Staff"],
    }),

    // Unassigned Staff
    unassignedStaff: builder.mutation({
      query: (payload) => ({
        url: "lab/unassigned-staff",
        method: "PUT",
        body: payload,
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
  useUnassignedStaffMutation,
} = StaffApi;
