import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import "./Categories.css";

import { MdDeleteForever } from "react-icons/md";
import { MdOutlineEditNote } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editingCat, setEditingCat] = useState(null); // التصنيف الجاري تعديله
  
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  // حالة النافذة
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [name, setName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // فتح النافذة للإضافة
  const openModal = () => {
    setEditingCat(null);
    setShowModal(true);
    setImageFile(null);
    setImagePreview("");
    setName("");
    setFileInputKey((prev) => prev + 1);
  };

  // فتح النافذة للتعديل
  const handleEdit = (cat) => {
    setEditingCat(cat);
    setShowModal(true);
    setName(cat.name);
    setImagePreview(cat.imageUrl); // عرض الصورة الحالية
    setImageFile(null); // لم نختر ملفًا بعد
    setFileInputKey((prev) => prev + 1);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCat(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async () => {
    // التحقق من الحقول (في حالة التعديل قد لا نغير الصورة)
    if (editingCat) {
      // في التعديل: لا بد من وجود اسم
      if (name.trim() === "") {
        alert("الرجاء إدخال اسم الصنف");
        return;
      }
    } else {
      // في الإضافة: لا بد من اسم + صورة
      if (!imageFile || name.trim() === "") {
        alert("الرجاء اختيار صورة وإدخال اسم الصنف");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingCat) {
        // تحديث تصنيف موجود
        const res = await api.put(`/categories/${editingCat._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setCategories(
          categories.map((c) => (c._id === editingCat._id ? res.data : c))
        );
      } else {
        // إضافة جديد
        const res = await api.post("/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setCategories([...categories, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("فشل في حفظ الصنف");
    }
  };

  if (loading)
    return <div className="loading-text">جاري تحميل المنتجات...</div>;

  return (
    <div className="categories">
      <div className="header-categories">
        <button onClick={openModal} className="add-categories">
          اضافة صنف +{" "}
        </button>
        <h2>الأصناف</h2>
      </div>

      <div className="all-box">
        {categories.map((cat) => (
          <div key={cat._id} className="box-cat">
            <div className="image">
              <img src={cat.imageUrl} alt={cat.name} />
            </div>
            <div className="name-cat">{cat.name}</div>
            <div className="icons">
              <button
                className="delete"
                onClick={async () => {
                  await api.delete(`/categories/${cat.name}`);
                  setCategories(categories.filter((c) => c._id !== cat._id));
                }}
              >
                <MdDeleteForever />
              </button>
              <button className="edit" onClick={() => handleEdit(cat)}>
                <MdOutlineEditNote />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCat ? "تعديل الصنف" : "إضافة صنف جديد"}</h3>

            <div
              className={`image-upload-area ${imagePreview ? "has-image" : ""}`}
            >
              {imagePreview ? (
                <label
                  htmlFor="category-image-upload"
                  className="upload-label preview-label"
                >
                  <div className="preview-image-wrapper">
                    <img
                      src={imagePreview}
                      alt="معاينة الصنف"
                      className="preview-image"
                    />
                    <div className="image-overlay">
                      <FaEdit className="overlay-icon" />
                      <span className="overlay-text">تغيير الصورة</span>
                    </div>
                  </div>
                </label>
              ) : (
                <label htmlFor="category-image-upload" className="upload-label">
                  <FaImage className="upload-icon" />
                  <span className="checked-img">اختر صورة للصنف</span>
                  <span className="upload-hint">(يمكنك اختيار صورة واحدة)</span>
                </label>
              )}
              <input
                key={fileInputKey}
                id="category-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="text">
              <span>اسم الصنف:</span>
              <input
                type="text"
                placeholder="أدخل اسم الصنف..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="buttons">
              <button className="btn-save" onClick={handleSave}>
                حفظ
              </button>
              <button className="btn-close" onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
