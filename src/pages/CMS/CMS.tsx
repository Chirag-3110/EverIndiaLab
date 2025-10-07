import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Spin, Tabs, Button, Empty } from "antd";

import { toast } from "react-toastify";
import { useGetCmsQuery, useUpdateCmsMutation } from "../../redux/api/cmsApi";

const { TabPane } = Tabs;

const tabMapping = {
  "terms-and-conditions": { field: "content", label: "Terms & Conditions" },
  "privacy-policy": { field: "privacy", label: "Privacy Policy" },
  "about-us": { field: "content", label: "About" },
};

const CMSEditor = () => {
  const [selectedTab, setSelectedTab] = useState("terms-and-conditions");
  const [serverContent, setServerContent] = useState("");
  const [isTabLoading, setIsTabLoading] = useState(false);

  // ✅ Fetch CMS by tab slug
  const {
    data: cmsData,
    isLoading,
    refetch,
  } = useGetCmsQuery({ slug: selectedTab });

  const [updateCms, { isLoading: isSaving }] = useUpdateCmsMutation();

  // ✅ TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "p-6 min-h-[300px] w-full prose prose-sm sm:prose lg:prose-lg border-0 outline-none dark:prose-invert dark:bg-gray-900 dark:text-gray-100",
      },
    },
  });

  // ✅ Update editor only when new data is ready
  useEffect(() => {
    if (!editor) return;

    if (cmsData?.response) {
      const field = tabMapping[selectedTab]?.field;
      const content = cmsData?.response?.[field] || "";
      setServerContent(content);
      editor.commands.setContent(content);
      setIsTabLoading(false);
    }
  }, [cmsData, editor, selectedTab]);

  // ✅ Handle tab change
  const handleTabChange = (key: string) => {
    setSelectedTab(key);
    setServerContent(""); // clear old content
    setIsTabLoading(true); // show loading spinner until new content arrives
  };

  // ✅ Save CMS update
  const handleSave = async () => {
    if (!editor) return;
    if (!cmsData?.response?._id) {
      toast.error("This page does not exist. Cannot edit.");
      return;
    }

    const htmlContent = editor.getHTML();
    const field = tabMapping[selectedTab]?.field;

    try {
      await updateCms({
        id: cmsData.response._id,
        body: {
          ...cmsData.response,
          [field]: htmlContent,
        },
      }).unwrap();

      toast.success(`Updated ${tabMapping[selectedTab].label} successfully!`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save content");
      editor?.commands.setContent(serverContent);
    }
  };

  const isWaiting = isLoading || !editor || isTabLoading;

  return (
    <div className="cms-editor p-4">
      <Tabs
        activeKey={selectedTab}
        onChange={handleTabChange}
        size="large"
        className="mb-4"
      >
        {Object.entries(tabMapping as Record<string, any>).map(
          ([key, { label }]) => (
            <TabPane tab={label} key={key} />
          )
        )}
      </Tabs>

      <div className="border rounded bg-white min-h-[300px] shadow-sm">
        {isWaiting ? (
          <div className="flex items-center justify-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : !serverContent && !cmsData?.response?._id ? (
          <div className="flex items-center justify-center h-[300px]">
            <Empty description="No content available for this page." />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <div className="mt-4 flex gap-4">
        <Button
          type="primary"
          onClick={handleSave}
          loading={isSaving}
          disabled={!editor || isSaving || isWaiting || !cmsData?.response?._id}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default CMSEditor;
