import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, message } from 'antd';
import { InboxOutlined, CloseOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

const { Dragger } = Upload;

function ImageUploadSection({ 
  preview,
  fileList,
  handleImageChange,
  resetImageState,
  item 
}) {
  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
  };

  const beforeUpload = useCallback((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  }, []);

  return (
    <div className="w-full relative !h-[300px]">
      {preview ? (
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={preview}
            alt="Book cover preview"
            className="object-contain max-w-full max-h-full rounded"
          />
          <button
            onClick={resetImageState}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer bg-white rounded-full shadow-md p-1.5 z-10 hover:bg-gray-100 transition-colors"
            aria-label="Remove image"
          >
            <CloseOutlined className="!text-red-500 text-base" />
          </button>
        </div>
      ) : (
        <Dragger
          accept=".jpg,.jpeg,.png,.webp,.jfif"
          fileList={fileList}
          onChange={handleImageChange}
          onPreview={onPreview}
          beforeUpload={beforeUpload}
          showUploadList={false}
          className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50"
        >
          <div className="p-4 text-center">
            <p className="ant-upload-drag-icon mb-3">
              <InboxOutlined className="text-4xl text-blue-500" />
            </p>
            <p className="ant-upload-text font-medium text-gray-700 text-base">
              Drag & drop an image here, or click to select
            </p>
            <p className="ant-upload-hint text-gray-500 text-sm mt-2">
              Supports JPG, JPEG, PNG, JFIF , WEBP (Max: 5MB)
            </p>
          </div>
        </Dragger>
      )}
    </div>
  );
}

export default React.memo(ImageUploadSection);