import React from "react";
import {
  useGetnotificationQuery,
  useMarkAsSeenNotificationMutation,
} from "../../redux/api/notificationApi";
import { formatDate } from "../../utils/utils";

const NotificationsDropdown = ({ open, onClose }) => {
  const { data } = useGetnotificationQuery({});
  const notifications = data?.response?.notifications || [];

  const [markAsSeenNotification] = useMarkAsSeenNotificationMutation();

  const handleMarkAsSeen = async () => {
    await markAsSeenNotification({}).unwrap();
  };

  return (
    <>
      {/* Background overlay (click to close) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[black/10] backdrop-blur-[2px] z-40 transition"
        ></div>
      )}

      {/* Notifications Panel */}
      <div
        className={`fixed right-5 top-16 w-80 bg-white shadow-xl rounded-lg border z-50 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold text-md">Notifications</h3>

          <button
            onClick={handleMarkAsSeen}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700"
          >
            Mark All Seen
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto p-3">
          {notifications.length === 0 && (
            <p className="text-center text-gray-400 py-5">
              No notifications available
            </p>
          )}

          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-2 rounded-md border mb-1 transition ${
                item.status === "unseen"
                  ? "bg-blue-50 border-blue-100"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {/* Title */}
              <div className="font-semibold mb-1 text-sm">{item.title}</div>

              {/* Description */}
              <div className="text-sm text-[12px]">{item.description}</div>

              {/* Date */}
              <div className="text-[10px] flex justify-end text-gray-500">
                {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsDropdown;
