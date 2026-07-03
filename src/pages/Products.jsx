import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./products.css";
import { MdDeleteForever } from "react-icons/md";
import {
  FaImage,
  FaEdit,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("الكل");
  const [saving, setSaving] = useState(false);

  // ✨ حالات مودال التأكيد
  const [confirmDelete, setConfirmDelete] = useState(null); // اسم المنتج المراد حذفه

  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories")
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error("فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts =
    selectedFilter === "الكل"
      ? products
      : products.filter((p) => p.categoryName === selectedFilter);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDown.current = false;
  };
  const handleMouseUp = () => {
    isDown.current = false;
  };
  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const handleTouchStart = (e) => {
    isDown.current = true;
    startX.current = e.touches[0].pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const handleTouchMove = (e) => {
    if (!isDown.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const handleTouchEnd = () => {
    isDown.current = false;
  };

  // ✨ فتح مودال التأكيد
  const handleDeleteClick = (productName) => {
    setConfirmDelete(productName);
  };

  // ✨ تأكيد الحذف
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/products/${encodeURIComponent(confirmDelete)}`);
      setProducts((prev) => prev.filter((p) => p.name !== confirmDelete));
      toast.success(`تم حذف "${confirmDelete}" بنجاح`);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("فشل في حذف المنتج");
    } finally {
      setConfirmDelete(null);
    }
  };

  // حالات المودال
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(0);

  const openAddModal = async () => {
    setEditingProduct(null);
    setShowModal(true);
    setImageFile(null);
    setImagePreview("");
    setName("");
    setPrice("");
    setSelectedCategory("");
    setIngredientsList([]);
    setNewIngredient("");
    setIsAvailable(true);
    setFileInputKey((prev) => prev + 1);
    try {
      const res = await api.get("/categories");
      setCategoriesList(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0].name);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("فشل جلب التصنيفات");
    }
  };

  const openEditModal = async (product) => {
    setEditingProduct(product);
    setShowModal(true);
    setName(product.name);
    setPrice(product.price);
    setSelectedCategory(product.categoryName || "");
    setImagePreview(product.imageUrl);
    setImageFile(null);
    setIngredientsList(product.ingredients || []);
    setNewIngredient("");
    setIsAvailable(product.isAvailable !== false);
    setFileInputKey((prev) => prev + 1);
    try {
      const res = await api.get("/categories");
      setCategoriesList(res.data);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("فشل جلب التصنيفات");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredientsList.includes(trimmed)) {
      setIngredientsList([...ingredientsList, trimmed]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const handleIngredientKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleSave = async () => {
    const nameStr = String(name).trim();
    const priceStr = String(price).trim();
    const catStr = String(selectedCategory).trim();
    if (!nameStr) return toast.error("الرجاء إدخال اسم المنتج");
    if (!priceStr) return toast.error("الرجاء إدخال سعر صحيح");
    if (!catStr) return toast.error("الرجاء اختيار تصنيف");
    if (!editingProduct && !imageFile)
      return toast.error("الرجاء اختيار صورة للمنتج");

    const formData = new FormData();
    formData.append("name", nameStr);
    formData.append("price", Number(priceStr));
    formData.append("categoryName", catStr);
    formData.append("ingredients", JSON.stringify(ingredientsList));
    formData.append("isAvailable", isAvailable);
    if (imageFile) formData.append("image", imageFile);

    setSaving(true);
    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data : p))
        );
        toast.success("تم تعديل المنتج بنجاح");
      } else {
        const res = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setProducts((prev) => [...prev, res.data]);
        toast.success("تم إضافة المنتج بنجاح");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || "فشل في حفظ المنتج");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="loading-text">جاري تحميل المنتجات...</div>;

  return (
    <div>
      {/* ... باقي المحتوى زي ما هو ... */}
      <div className="header-products">
        <h2 className="page-title-products">
          المنتجات ({filteredProducts.length})
        </h2>
        <button className="add-products" onClick={openAddModal}>
          <FaPlus /> اضافة منتج
        </button>
      </div>

      <div
        className="categories-slider"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className={`filter-btn ${selectedFilter === "الكل" ? "active" : ""}`}
          onClick={() => setSelectedFilter("الكل")}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`filter-btn ${selectedFilter === cat.name ? "active" : ""}`}
            onClick={() => setSelectedFilter(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="main-products">
        {filteredProducts.map((p) => (
          <div className="box-product" key={p._id || p.name}>
            <span
              className={`availability-badge ${p.isAvailable !== false ? "available" : "unavailable"}`}
            >
              {p.isAvailable !== false ? "متاح" : "غير متاح"}
            </span>
            <div className="product-image">
              <img src={p.imageUrl} alt={p.name} />
            </div>
            <div className="text-product">
              <span className="text-product-name">{p.name}</span>
              {p.ingredients && p.ingredients.length > 0 && (
                <div className="product-ingredients-preview">
                  {p.ingredients.map((ing, i) => (
                    <span key={i} className="ingredient-tag">
                      {ing}
                    </span>
                  ))}
                </div>
              )}
              <span>{p.price} SY</span>
            </div>
            <div className="buttons-product">
              <button className="edit-product" onClick={() => openEditModal(p)}>
                <FaEdit /> تعديل
              </button>
              <button
                className="delete-product"
                onClick={() => handleDeleteClick(p.name)}
              >
                <MdDeleteForever />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="no-products-message">
            لا توجد منتجات في هذا التصنيف
          </div>
        )}
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
              هل أنت متأكد من حذف "<strong>{confirmDelete}</strong>"؟
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
            {/* ... نفس محتوى المودال السابق ... */}
            <div className="modal-header">
              <h3>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div
              className={`image-upload-area ${imagePreview ? "has-image" : ""}`}
            >
              {imagePreview ? (
                <label
                  htmlFor="product-image-upload"
                  className="upload-label preview-label"
                >
                  <div className="preview-image-wrapper">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="preview-image"
                    />
                    <div className="image-overlay">
                      <FaEdit className="overlay-icon" />
                      <span className="overlay-text">تغيير الصورة</span>
                    </div>
                  </div>
                </label>
              ) : (
                <label htmlFor="product-image-upload" className="upload-label">
                  <FaImage className="upload-icon" />
                  <span className="checked-img">اختر صورة للمنتج</span>
                  <span className="upload-hint">(يمكنك اختيار صورة واحدة)</span>
                </label>
              )}
              <input
                key={fileInputKey}
                id="product-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="form-group">
              <label>اسم المنتج:</label>
              <input
                type="text"
                placeholder="أدخل اسم المنتج..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>السعر (SY):</label>
              <input
                type="number"
                placeholder="أدخل السعر..."
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>التصنيف:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>المكونات:</label>
              <div className="ingredients-input-row">
                <input
                  type="text"
                  placeholder="أدخل مكون واضغط Enter"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={handleIngredientKeyDown}
                />
                <button
                  type="button"
                  className="btn-add-ingredient"
                  onClick={addIngredient}
                >
                  <FaPlus />
                </button>
              </div>
              {ingredientsList.length > 0 && (
                <div className="ingredients-tags">
                  {ingredientsList.map((ing, index) => (
                    <span key={index} className="ingredient-tag editable">
                      {ing}
                      <button
                        type="button"
                        className="btn-remove-ingredient"
                        onClick={() => removeIngredient(index)}
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <span>المنتج متاح</span>
              </label>
            </div>

            <div className="modal-buttons">
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
                className="btn-cancel"
                onClick={closeModal}
                disabled={saving}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
