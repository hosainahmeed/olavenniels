import React, { useEffect } from "react";
import { Form, Input, Select, Button, Tabs } from "antd";
import { useAudioBookForm } from "./AudioBookCreateHelpers.js";
import toast from "react-hot-toast";
import TagsSelect from "../share/TagsSelect.jsx";
import { imageUrl } from "../../../../utils/server.js";
import { useGetCategoriesQuery } from "../../../../Redux/Apis/service/categoryApis.js";
import { useAddEBookMutation, useUpdateEBookMutation } from "../../../../Redux/Apis/books/eBookApi.js";
import PdfUploadSection from "./PdfUploadSection.jsx";
import ImageUploadSection from "../audio_related/ImageUploadSection.jsx";

const { TabPane } = Tabs;

const EbookCreate = ({ setShowModal, item, setSelectedItem }) => {
  const [form] = Form.useForm();
  const {
    preview,
    image,
    pdfFile,
    fileList,
    pdfInputRef,
    handleImageChange,
    resetImageState,
    resetAllState,
    setPreview,
    setFileList,
    setPdfFile,
  } = useAudioBookForm();

  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery({});
  const [addEBook, { isLoading: isSubmitting }] = useAddEBookMutation();
  const [updateEBook, { isLoading: isUpdating }] = useUpdateEBookMutation();

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        bookName: item?.bookName,
        synopsis: item?.synopsis,
        category: item?.category?._id,
        tags: item?.tags,
        totalPages: item?.totalPages,
        bookCover: item?.bookCover,
        pdfFile: item?.pdfFile,
      });

      if (item?.bookCover) {
        const imageUrlStr = imageUrl(item.bookCover);
        setPreview(imageUrlStr);
        setFileList([
          {
            uid: "-1",
            name: "current-image.png",
            status: "done",
            url: imageUrlStr,
          },
        ]);
      } else {
        setPreview(null);
        setFileList([]);
      }

      if (item?.pdfFile) {
        setPdfFile(imageUrl(item.pdfFile));
      } else {
        setPdfFile(null);
        if (pdfInputRef.current) {
          pdfInputRef.current.value = "";
        }
      }
    } else {
      form.resetFields();
      resetAllState();
    }
  }, [item]);

  const handleSubmit = async (values) => {
    try {

      const formData = new FormData();
      formData.append("bookName", values.bookName);
      formData.append("synopsis", values.synopsis);
      formData.append("category", values.category);
      formData.append("tags", values.tags);
      formData.append("totalPages", values.totalPages);
      formData.append("bookCover", image);
      formData.append("pdfFile", pdfFile);

      let response;
      if (item) {
        response = await updateEBook({ id: item._id, data: formData }).unwrap();
      } else {
        response = await addEBook({ data: formData }).unwrap();
      }

      if (response?.success) {
        toast.success(
          response?.message || (item ? "Ebook Updated Successfully" : "Ebook Created Successfully")
        );
        form.resetFields();
        resetAllState();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(
        error?.data?.message || (item ? "Failed to update ebook" : "Failed to create ebook")
      );
      console.error(`Error ${item ? "updating" : "creating"} ebook:`, error);
    }
  };

  return (
    <div className="flex gap-6 w-full">
      <Tabs style={{ width: "100%" }}>
        <TabPane tab="Upload Book Cover Image" key="1">
          <ImageUploadSection
            item={item}
            image={image}
            preview={preview}
            fileList={fileList}
            setFileList={setFileList}
            handleImageChange={handleImageChange}
            resetImageState={resetImageState}
          />
          <Button
            className="!bg-[var(--secondary-color)] !mt-3 hover:!bg-[var(--secondary-color)] border-none !text-white"
            onClick={() => { setShowModal(false), setSelectedItem(null) }}
          >
            Close
          </Button>
        </TabPane>

        <TabPane tab="Fill Details" key="2">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Add Ebook</h2>
            <Form layout="vertical" requiredMark={false} onFinish={handleSubmit} form={form}>
              <Form.Item
                label="Book Name"
                name="bookName"
                rules={[{ required: true, message: "Please enter book name" }]}
              >
                <Input placeholder="Type here" />
              </Form.Item>

              <Form.Item
                label="Synopsis"
                name="synopsis"
                rules={[{ required: true, message: "Please enter synopsis" }]}
              >
                <Input.TextArea rows={3} placeholder="Type here" showCount maxLength={2000} />
              </Form.Item>

              <Form.Item
                label="Select Category"
                name="category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select Category" loading={categoriesLoading} optionFilterProp="children">
                  {categories?.data?.bookCategories?.map((category) => (
                    <Select.Option key={category?._id} value={category?._id}>
                      {category?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Total Pages"
                name="totalPages"
                rules={[{ required: true, message: "Please enter total pages" }]}
              >
                <Input placeholder="Input total pages" type="number" />
              </Form.Item>

              {/* <TagsSelect form={form} item={item} /> */}

              <PdfUploadSection form={form} pdfFile={pdfFile} setPdfFile={setPdfFile} />

              <Form.Item className="flex items-center justify-end !mt-2">
                <Button
                  className="!bg-[var(--secondary-color)] !mr-2 hover:!bg-[var(--secondary-color)] border-none !text-white"
                  onClick={() => { setShowModal(false), setSelectedItem(null) }}
                >
                  Close
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-yellow-500 hover:!bg-yellow-600 border-none px-6"
                  loading={isSubmitting || isUpdating}
                >
                  Publish
                </Button>
              </Form.Item>
            </Form>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default EbookCreate;
