import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserApi = createApi({
  reducerPath: "UserApi",
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
  tagTypes: ["User"],

  endpoints: (builder) => ({
    // Add User
    addUser: builder.mutation({
      query: (userData) => ({
        url: "user/app/add-new-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // Get All Users
    getUsers: builder.query<any, string>({
      query: (searchText) => `user/app/list-users?search=${searchText}`,
      providesTags: ["User"],
    }),

    // Delete User
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user/app/delete-user/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["User"],
    }),

    // Update/Edit User
    editUser: builder.mutation({
      query: ({ id, formData }) => ({
        url: `user/app/update-user/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Update User Status (block/unblock)
    updateUserStatus: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `user/app/update-user-status/${id}`,
        method: "PUT",
        body: formdata,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useAddUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useEditUserMutation,
  useUpdateUserStatusMutation,
} = UserApi;
