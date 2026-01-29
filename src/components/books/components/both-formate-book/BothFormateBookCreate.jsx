import React, { useEffect } from "react";
import { Form, Input, Select, Button, Tabs, TimePicker } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useGetCategoriesQuery } from "../../../../Redux/Apis/service/categoryApis";
import ImageUploadSection from "../audio_related/ImageUploadSection.jsx";
import toast from "react-hot-toast";
import { imageUrl } from "../../../../utils/server.js";
import TagsSelect from "../share/TagsSelect.jsx";
import { prepareFormData, useAudioBookForm } from "../book-creation/AudioBookCreateHelpers.js";
import PdfUploadSection from "../book-creation/PdfUploadSection.jsx";
import { useAddBothFormatBookMutation, useUpdateBothFormatBookMutation } from "../../../../Redux/Apis/books/bothFormatBook.js";
import dayjs from "dayjs";
const { TabPane } = Tabs;

const AudioUploadField = ({
    audioInputRef,
    handleAudioUpload,
    audioFile,
    audioUrl,
    resetAudioState,
    form,
    existingAudioUrl,
}) => {
    const handleFileChange = (e) => {
        const result = handleAudioUpload(e);
        if (!result.isValid) {
            form.setFields([{ name: "audio", errors: [result.error] }]);
        } else {
            form.setFields([{ name: "audio", errors: [] }]);
        }
    };

    const handleRemoveAudio = (e) => {
        e.preventDefault();
        resetAudioState();
        if (existingAudioUrl) {
            form.setFieldsValue({ audio: null });
        }
    };

    return (
        <div>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio File {!existingAudioUrl && <span className="text-red-500">*</span>}
                </label>
                <Form.Item
                    name="audio"
                    validateStatus={form.getFieldError("audio") ? "error" : ""}
                    help={form.getFieldError("audio")}
                    className="mb-0"
                >
                    <div className="relative">
                        <input
                            type="file"
                            accept="audio/mpeg"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                            ref={audioInputRef}
                        />
                        <div className="flex items-center justify-between border border-gray-300 px-4 py-2 rounded-md bg-white">
                            <span className="text-gray-600 truncate max-w-[80%]">
                                {audioFile?.name || "Upload book audio (MP3)"}
                            </span>
                            <span className="text-blue-600 text-sm">Browse</span>
                        </div>
                    </div>
                </Form.Item>
            </div>

            {(audioUrl || existingAudioUrl) && (
                <div className="border border-gray-300 p-2 rounded mt-2 relative">
                    <audio
                        src={audioUrl || imageUrl(existingAudioUrl)}
                        controls
                        className="w-full h-[100px] rounded"
                    />
                    {!existingAudioUrl && <button
                        onClick={handleRemoveAudio}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center cursor-pointer bg-white rounded-full shadow"
                        aria-label="Remove audio"
                    >
                        <CloseOutlined className="!text-red-500" />
                    </button>}
                </div>
            )}
        </div>
    );
};

const BothFormateBookCreate = ({ setShowModal, item, setSelectedItem }) => {
    const [form] = Form.useForm();
    const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery({});
    const [addBothFormatBook, { isLoading: isSubmitting }] = useAddBothFormatBookMutation();
    const [updateBothFormatBook] = useUpdateBothFormatBookMutation();
    const {
        preview,
        image,
        audioFile,
        audioUrl,
        fileList,
        audioInputRef,
        pdfFile,
        handleImageChange,
        handleAudioUpload,
        resetImageState,
        resetAudioState,
        resetAllState,
        setPreview,
        setFileList,
        setAudioUrl,
        setPdfFile,
    } = useAudioBookForm();

    useEffect(() => {
        if (item) {
            form.setFieldsValue({
                bookName: item?.bookName,
                synopsis: item?.synopsis,
                category: item?.category?._id,
                tags: item?.tags,
                totalPages: item?.totalPages,
                bookCover: item?.bookCover,
                audioUrl: item?.audioUrl,
                pdfFile: item?.pdfFile,
            });

            if (item?.bookCover) {
                const imageUrlStr = imageUrl(item.bookCover);
                setPreview(imageUrlStr);
                setFileList([{
                    uid: '-1',
                    name: 'current-image.png',
                    status: 'done',
                    url: imageUrlStr,
                }]);
            } else {
                setPreview(null);
                setFileList([]);
            }

            if (item?.audioUrl) {
                setAudioUrl(imageUrl(item.audioUrl));
            } else {
                setAudioUrl(null);
                if (audioInputRef.current) {
                    audioInputRef.current.value = "";
                }
            }
        } else {
            form.resetFields();
            resetAllState();
        }
    }, [item]);

    const handleSubmit = async (values) => {
        if (!item && !audioFile) {
            form.setFields([{ name: "audio", errors: ["Please upload an audio file"] }]);
            return;
        }

        try {
            const formData = prepareFormData(
                values,
                audioFile,
                image,
                item?.audioUrl,
                item?.bookCover,
                pdfFile,
                item?.audioUrl,
                item?.bookCover,
                item?.pdfFile,
            );

            formData.append("pdfFile", pdfFile)

            try {
                let response;
                if (item) {
                    response = await updateBothFormatBook({ id: item._id, data: formData }).unwrap();
                } else {
                    response = await addBothFormatBook({ data: formData }).unwrap();
                }

                if (response?.success) {
                    toast.success(response?.message || (item ? "Audio Book Updated Successfully" : "Audio Book Created Successfully"));
                    form.resetFields();
                    resetAllState();
                    setShowModal(false);
                }
            } catch (error) {
                throw error;
            }
        } catch (error) {
            toast.error(error?.data?.message || (item ? "Failed to update audio book" : "Failed to create audio book"));
            console.error(`Error ${item ? 'updating' : 'creating'} audio book:`, error);
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
                        <h2 className="text-xl font-semibold mb-4">Add Both Formate Book</h2>
                        <Form
                            layout="vertical"
                            requiredMark={false}
                            onFinish={handleSubmit}
                            form={form}
                        >
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
                                <Select
                                    placeholder="Select Category"
                                    loading={categoriesLoading}
                                    optionFilterProp="children"
                                >
                                    {categories?.data?.bookCategories?.map((category) => (
                                        <Select.Option key={category?._id} value={category?._id}>
                                            {category?.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* <TagsSelect form={form} item={item} /> */}

                            <Form.Item label="Total Pages" name="totalPages">
                                <Input
                                    name="totalPages"
                                    placeholder="Type here"
                                    type="number"
                                    min={1}
                                    rules={[{ required: true, message: "Please enter total pages" }]}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Duration"
                                name="duration"
                                getValueProps={(value) => ({
                                    value: value ? dayjs(value, 'HH:mm:ss') : null
                                })}
                                normalize={(value) => value ? value.format('HH:mm:ss') : null}
                            >
                                <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                            </Form.Item>
                            <AudioUploadField
                                audioInputRef={audioInputRef}
                                handleAudioUpload={handleAudioUpload}
                                audioFile={audioFile}
                                audioUrl={audioUrl}
                                resetAudioState={resetAudioState}
                                form={form}
                                existingAudioUrl={item?.audioFile}
                            />
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
                                    loading={isSubmitting}
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

export default BothFormateBookCreate