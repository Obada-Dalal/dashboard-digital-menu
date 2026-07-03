import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./Categories.css";
import { MdDeleteForever } from "react-icons/md";
import { MdOutlineEditNote } from "react-icons/md";
import {
  FaImage,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✨ حالات مودال التأكيد
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("فشل في تحميل التصنيفات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [name, setName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const openModal = () => {
    setEditingCat(null);
    setShowModal(true);
    setImageFile(null);
    setImagePreview("");
    setName("");
    setFileInputKey((prev) => prev + 1);
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setShowModal(true);
    setName(cat.name);
    setImagePreview(cat.imageUrl);
    setImageFile(null);
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✨ فتح مودال التأكيد
  const handleDeleteClick = (cat) => {
    setConfirmDelete(cat);
  };

  // ✨ تأكيد الحذف
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/categories/${confirmDelete.name}`);
      setCategories(categories.filter((c) => c._id !== confirmDelete._id));
      toast.success(`تم حذف "${confirmDelete.name}" بنجاح`);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("فشل في حذف التصنيف");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSave = async () => {
    if (editingCat) {
      if (name.trim() === "") return toast.error("الرجاء إدخال اسم الصنف");
    } else {
      if (!imageFile || name.trim() === "")
        return toast.error("الرجاء اختيار صورة وإدخال اسم الصنف");
    }

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    setSaving(true);
    try {
      if (editingCat) {
        const res = await api.put(`/categories/${editingCat._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setCategories(
          categories.map((c) => (c._id === editingCat._id ? res.data : c))
        );
        toast.success("تم تعديل التصنيف بنجاح");
      } else {
        const res = await api.post("/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setCategories([...categories, res.data]);
        toast.success("تم إضافة التصنيف بنجاح");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || "فشل في حفظ التصنيف");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="loading-text">جاري تحميل التصنيفات...</div>;

  return (
    <div className="categories">
      <div className="header-categories">
        <button onClick={openModal} className="add-categories">
          اضافة صنف +
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
              <button className="delete" onClick={() => handleDeleteClick(cat)}>
                <MdDeleteForever />
              </button>
              <button className="edit" onClick={() => handleEdit(cat)}>
                <MdOutlineEditNote />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✨ مودال تأكيد الحذف */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <FaExclamationTriangle />
            </div>
            <h3 className="confirm-title">تأكيد الحذف</h3>
            <p className="confirm-text">
              هل أنت متأكد من حذف "<strong>{confirmDelete.name}</strong>"؟
            </p>
            <p className="confirm-warning">لا يمكن التراجع عن هذا الإجراء!</p>
            <div className="confirm-buttons">
              <button
                className="confirm-btn-delete"
                onClick={handleConfirmDelete}
              >
                نعم، احذف
              </button>
              <button
                className="confirm-btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الإضافة/التعديل */}
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
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner-icon" /> جاري الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </button>
              <button
                className="btn-close"
                onClick={closeModal}
                disabled={saving}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
