import { useEffect, useState } from "react";
import api from "../services/api";
import "./Ads.css";

import { MdDeleteForever } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // مودال الإضافة فقط (لا يوجد تعديل)
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/ads");
        setAds(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const openModal = () => {
    setShowModal(true);
    setImageFile(null);
    setImagePreview("");
    setFileInputKey((prev) => prev + 1);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!imageFile) {
      alert("الرجاء اختيار صورة");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await api.post("/ads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAds([res.data, ...ads]); // نضيف الجديد في البداية
      closeModal();
    } catch (err) {
      console.error(err);
      alert("فشل في إضافة الإعلان");
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      await api.delete(`/ads/${adId}`);
      setAds(ads.filter((ad) => ad._id !== adId));
    } catch (err) {
      console.error("حذف الإعلان فشل:", err);
      alert("لم يتم حذف الإعلان");
    }
  };

  if (loading)
    return <div className="ads-loading">جاري تحميل الإعلانات...</div>;

  return (
    <div className="ads-container">
      <div className="ads-header">
        <h2 className="ads-page-title">اللوغو</h2>
        <button className="ads-add-btn" onClick={openModal}>
          + إضافة لوغو
        </button>
      </div>

      <div className="ads-grid">
        {ads.map((ad) => (
          <div className="ad-card" key={ad._id}>
            <div className="ad-image-container">
              <img src={ad.imageUrl} alt="إعلان" className="ad-image" />
            </div>
            <div className="ad-actions">
              <button
                className="ad-delete-btn"
                onClick={() => handleDelete(ad._id)}
              >
                <MdDeleteForever />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* مودال إضافة إعلان فقط */}
      {showModal && (
        <div className="ad-modal-overlay" onClick={closeModal}>
          <div
            className="ad-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>إضافة إعلان جديد</h3>

            <div
              className={`ad-image-upload-area ${imagePreview ? "has-image" : ""}`}
            >
              {imagePreview ? (
                <label
                  htmlFor="ad-image-upload"
                  className="ad-upload-label ad-preview-label"
                >
                  <div className="ad-preview-image-wrapper">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="ad-preview-image"
                    />
                    <div className="ad-image-overlay">
                      <FaEdit className="ad-overlay-icon" />
                      <span className="ad-overlay-text">تغيير الصورة</span>
                    </div>
                  </div>
                </label>
              ) : (
                <label htmlFor="ad-image-upload" className="ad-upload-label">
                  <FaImage className="ad-upload-icon" />
                  <span className="ad-upload-text">اختر صورة للإعلان</span>
                  <span className="ad-upload-hint">
                    (يمكنك اختيار صورة واحدة)
                  </span>
                </label>
              )}
              <input
                key={fileInputKey}
                id="ad-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="ad-modal-buttons">
              <button className="ad-save-btn" onClick={handleSave}>
                حفظ
              </button>
              <button className="ad-close-btn" onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
