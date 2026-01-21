import React, { useState } from "react";
import { Form, Input, Select, Button, Tabs, Upload } from "antd";
import { motion } from "framer-motion";
import { CloseOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import CustomInput from "../../form-component/CustomInput";
const { Dragger } = Upload;
function BookCreate({ setShowModal }) {
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Handle cropped image selection
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      setImage(file);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  // PDF upload handler
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setPdfUrl(URL.createObjectURL(file));
        form.setFields([{ name: "pdf", errors: [] }]);
      } else {
        form.setFields([
          { name: "pdf", errors: ["Please upload a valid PDF file"] },
        ]);
        e.target.value = "";
      }
    }
  };

  const onFinish = (values) => {
    const data = { ...values, pdf: pdfFile, image: image };
    console.log("Received values of form:", data);
  };


  const props = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  return (
    <div className="flex gap-6 w-full">
      <Tabs style={{ width: "100%" }}>
        {/* Upload Tab */}
        <Tabs.TabPane tab="Upload Book Cover Image" key="1">
          {/* <div className="w-full border border-dashed border-gray-300 rounded flex items-center justify-center relative !h-[300px]">
            {preview ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={preview}
                alt="Preview"
                className="object-cover !w-[178px] !h-[200px] rounded"
              />
            ) : (
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageChange}
                beforeUpload={() => false}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl">📷</span>
                  <span>Upload book cover image</span>
                </div>
              </Upload>
            )}

            {preview && (
              <button
                onClick={() => {
                  setPreview(null);
                  setImage(null);
                  setFileList([]);
                }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center cursor-pointer bg-white rounded-full shadow p-1"
              >
                <CloseOutlined className="!text-red-500" />
              </button>
            )}
          </div> */}
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other
              banned files.
            </p>
          </Dragger>
          <Button
            className="!bg-[var(--secondary-color)] !mt-2 hover:!bg-[var(--secondary-color)] border-none !text-white"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Tabs.TabPane>

        {/* Details Tab */}
        <Tabs.TabPane tab="Fill Details" key="2">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Add E-Book</h2>
            <Form
              layout="vertical"
              requiredMark={false}
              onFinish={onFinish}
              form={form}
            >
              {/* <Form.Item
                label="Book Name"
                name="bookName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Type here" />
              </Form.Item> */}
              <CustomInput
                placeholder="Type here"
                name="bookName"
                rules={[{ required: true }]}
                label="Book Name"
              />

              <Form.Item
                label="Synopsis"
                name="synopsis"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={3} placeholder="Type here" />
              </Form.Item>

              <Form.Item
                label="Select Category"
                name="category"
                rules={[{ required: true }]}
                initialValue="fiction"
              >
                <Select>
                  <Select.Option value="fiction">Fiction</Select.Option>
                  <Select.Option value="download">Downloaded</Select.Option>
                  <Select.Option value="inProgress">In Progress</Select.Option>
                  <Select.Option value="finished">Finished</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Add PDF File"
                name="pdf"
                rules={[
                  {
                    validator: () => {
                      if (!pdfFile) {
                        return Promise.reject(
                          new Error("Please upload a PDF file")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handlePdfUpload}
                />
                <div className="flex items-center justify-between border px-4 py-2 rounded bg-white">
                  <span className="text-gray-600">
                    {pdfFile?.name || "Upload book pdf"}
                  </span>
                  <span className="text-blue-600 text-sm">Browse</span>
                </div>
              </Form.Item>

              {pdfUrl && (
                <div className="border border-gray-300 rounded mt-2 relative">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[300px] rounded"
                    title="PDF Preview"
                  ></iframe>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setPdfUrl(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center cursor-pointer bg-white rounded-full shadow"
                  >
                    <CloseOutlined className="!text-red-500" />
                  </button>
                </div>
              )}

              <Form.Item
                label="Total Page"
                name="totalPage"
                rules={[{ required: true }]}
              >
                <Input type="number" placeholder="Type here" />
              </Form.Item>

              <Form.Item>
                <Button
                  className="!bg-[var(--secondary-color)] !mr-2 hover:!bg-[var(--secondary-color)] border-none !text-white"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-yellow-500 hover:!bg-yellow-600 border-none px-6"
                >
                  Publish
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default BookCreate;
