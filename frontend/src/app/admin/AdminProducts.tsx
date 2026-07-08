import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Package,
  AlertTriangle,
  ChevronDown,
  AlertCircle,
  Check,
  ImagePlus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Product } from "../interfaces/productInterface";
import axios from "axios";
import { Schema } from "mongoose";
import { useUploadThing } from "../lib/uploadthing";

const CATEGORIES = [
  "Teas & Infusions",
  "Oils & Serums",
  "Supplements",
  "Skincare",
  "Powders & Blends",
  "Tonics & Syrups",
];

const BADGES = ["", "Bestseller", "Premium", "New", "Organic"];


interface FormErrors {
  [key: string]: string;
}

const getUploadThingKeyFromUrl = (imageUrl: string): string => {
  try {
    const url = new URL(imageUrl);
    const host = url.hostname.toLowerCase();
    const isUploadThingUrl =
      host.includes("uploadthing.com") ||
      host.includes("ufs.sh") ||
      host.includes("utfs.io");

    if (!isUploadThingUrl) return "";

    const parts = url.pathname.split("/").filter(Boolean);
    const fileSegmentIndex = parts.indexOf("f");
    const key =
      fileSegmentIndex >= 0
        ? parts[fileSegmentIndex + 1]
        : parts[parts.length - 1];

    return key ? decodeURIComponent(key) : "";
  } catch {
    return "";
  }
};


const IMAGE_URL_REGEX =
  /^https?:\/\/\S+$/i;

const validateProduct = (form: Omit<Product, "_id">): FormErrors => {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Product name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (form.name.trim().length > 100) {
    errors.name = "Name cannot exceed 100 characters.";
  }

  if (!form.sinhalaName.trim()) {
    errors.sinhalaName = "Sinhala name is required.";
  } else if (form.sinhalaName.trim().length < 2) {
    errors.sinhalaName = "Must be at least 2 characters.";
  }

  if (!form.category) {
    errors.category = "Category is required.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length > 1000) {
    errors.description = "Description cannot exceed 1000 characters.";
  }

  if (!form.price) {
    errors.price = "Price is required.";
  }

  if (!form.image.trim()) {
    errors.image = "Product image is required.";
  } else if (!IMAGE_URL_REGEX.test(form.image.trim())) {
    errors.image = "Must be a valid image URL.";
  }

  if (form.badge && !["Bestseller", "Premium", "New", "Organic"].includes(form.badge)) {
    errors.badge = "Invalid badge value.";
  }

  return errors;
};


function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        backgroundColor: type === "error" ? "#D4183D" : "#2D5016",
        color: "#FAF6EE",
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "360px",
      }}
    >
      {type === "error" ? <AlertCircle size={15} /> : <Check size={15} />}
      {message}
    </div>
  );
}


function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "4px",
      }}
    >
      <AlertCircle size={12} style={{ color: "#D4183D", flexShrink: 0 }} />
      <p style={{ color: "#D4183D", fontSize: "0.73rem", margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

const emptyForm = (): Omit<Product, "_id"> => ({
  name: "",
  sinhalaName: "",
  category: CATEGORIES[0],
  description: "",
  benefits: [""],
  ingredients: [""],
  howToUse: [""],
  price: "",
  image: "",
  badge: "",
});


function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#2D5016",
          fontSize: "0.82rem",
          marginBottom: "6px",
        }}
      >
        {label} {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "10px",
          border: `1.5px solid ${error ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
          backgroundColor: error ? "rgba(212,24,61,0.04)" : "#FAF6EE",
          color: "#2D5016",
          fontSize: "0.88rem",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
      />
      <FieldError message={error} />
    </div>
  );
}


function TagsField({
  label,
  values,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const update = (i: number, v: string) => {
    const copy = [...values];
    copy[i] = v;
    onChange(copy);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, ""]);

  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#2D5016",
          fontSize: "0.82rem",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: "6px" }}>
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1.5px solid rgba(45,80,22,0.2)",
                backgroundColor: "#FAF6EE",
                color: "#2D5016",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                border: "1px solid rgba(212,24,61,0.2)",
                backgroundColor: "rgba(212,24,61,0.06)",
                color: "#D4183D",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#4A7C23",
            border: "1px dashed rgba(74,124,35,0.4)",
            backgroundColor: "rgba(74,124,35,0.05)",
            padding: "6px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          <Plus size={13} /> Add {label.split(" ")[0]}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}


export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "_id">>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<Schema.Types.ObjectId | string>("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [uploadedImageKey, setUploadedImageKey] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [originalImageKey, setOriginalImageKey] = useState("");
  const [imageUploadStep, setImageUploadStep] = useState(
    "Step 1: Select a product image."
  );
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { startUpload, isUploading } = useUploadThing("productImage", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setImageUploading(true);
      setUploadProgress(0);
      setImageUploadStep("Step 3: Uploading the new image...");
    },
    onUploadProgress: setUploadProgress,
  });

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImageFile);
    setSelectedImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImageFile]);

  useEffect(() => {
    getProducts();
  }, []);

  
  async function getProducts() {
    try {
      setLoading(true);
      const res = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/user/products-all"
      );
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      showToast("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  }

  
  async function saveProduct(product: Product): Promise<void> {
    await axios.post(
      import.meta.env.VITE_BACKEND_URL + "/admin/add-product",
      { product },
      { withCredentials: true }
    );
  }

  async function editProduct(product: Product): Promise<void> {
    await axios.put(
      import.meta.env.VITE_BACKEND_URL + "/admin/update-product",
      { product },
      { withCredentials: true }
    );
  }

  async function deleteProductApi(
    id: Schema.Types.ObjectId | string
  ): Promise<void> {
    await axios.delete(
      import.meta.env.VITE_BACKEND_URL + "/admin/delete-product",
      { data: { id }, withCredentials: true }
    );
  }

  async function deleteUploadedImageApi(key: string): Promise<void> {
    await axios.delete(
      import.meta.env.VITE_BACKEND_URL + "/admin/uploadthing-file",
      { data: { key }, withCredentials: true }
    );
  }

  const resetSelectedImage = () => {
    setSelectedImageFile(null);
    setUploadProgress(0);
    setImageUploadStep(
      formData.image
        ? "Step 1: Current image is ready. Select a new image to replace it."
        : "Step 1: Select a product image."
    );

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageFileSelect = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast("Image must be 4MB or smaller.", "error");
      return;
    }

    setSelectedImageFile(file);
    setUploadProgress(0);
    setImageUploadStep(
      formData.image
        ? "Step 2: New image selected. Upload to replace the current image."
        : "Step 2: Image selected. Upload it to continue."
    );
  };

  const uploadSelectedImage = async (): Promise<string> => {
    if (!selectedImageFile) {
      return formData.image;
    }

    if (uploadedImageKey) {
      setImageDeleting(true);
      setImageUploadStep(
        "Step 3: Deleting the previously uploaded image..."
      );
      await deleteUploadedImageApi(uploadedImageKey);
      setUploadedImageKey("");
      set("image", "");
    }

    setImageUploadStep("Step 4: Uploading the selected image...");
    setImageUploading(true);

    const result = await startUpload([selectedImageFile]);
    const uploaded = result?.[0];
    const imageUrl =
      uploaded?.serverData?.url ?? uploaded?.ufsUrl ?? uploaded?.url;

    if (!uploaded || !imageUrl) {
      throw new Error("Upload completed without an image URL.");
    }

    set("image", imageUrl);
    setUploadedImageKey(uploaded.key ?? "");
    setSelectedImageFile(null);
    setUploadProgress(100);
    setImageUploadStep("Step 5: Image uploaded and ready to save.");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    return imageUrl;
  };

  const handleUploadSelectedImage = async () => {
    if (!selectedImageFile) {
      imageInputRef.current?.click();
      return;
    }

    try {
      await uploadSelectedImage();
      showToast("Image uploaded successfully.", "success");
    } catch (err: any) {
      const message =
        err.response?.data?.message ??
        err.message ??
        "Failed to upload image.";
      setImageUploadStep("Upload failed. Select or upload an image again.");
      showToast(message, "error");
    } finally {
      setImageDeleting(false);
      setImageUploading(false);
    }
  };

  
  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  
  const openAdd = () => {
    setFormData(emptyForm());
    setFormErrors({});
    setUploadProgress(0);
    setImageUploading(false);
    setImageDeleting(false);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setUploadedImageKey("");
    setOriginalImageUrl("");
    setOriginalImageKey("");
    setImageUploadStep("Step 1: Select a product image.");
    setEditingId("");
    setModalMode("add");
  };

  const openEdit = (product: Product) => {
    const { _id, ...rest } = product;
    setFormData({
      ...rest,
      benefits: [...rest.benefits],
      ingredients: [...rest.ingredients],
      howToUse: [...(rest.howToUse ?? [])],
    });
    setFormErrors({});
    setUploadProgress(0);
    setImageUploading(false);
    setImageDeleting(false);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setUploadedImageKey("");
    setOriginalImageUrl(rest.image);
    setOriginalImageKey(getUploadThingKeyFromUrl(rest.image));
    setImageUploadStep(
      "Step 1: Current image is ready. Select a new image to replace it."
    );
    setEditingId(_id);
    setModalMode("edit");
  };

  
  const handleSave = async () => {
    try {
      setSaveLoading(true);

      let productData = formData;
      if (selectedImageFile) {
        setImageUploadStep(
          "Step 3: Saving detected a new selected image. Uploading it first..."
        );
        const uploadedImageUrl = await uploadSelectedImage();
        productData = { ...formData, image: uploadedImageUrl };
        setFormData(productData);
      }

      const errors = validateProduct(productData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (modalMode === "add") {
        await saveProduct({
          ...productData,
          badge: productData.badge || undefined,
        } as Product);
        showToast("Product added successfully.", "success");
      } else if (editingId) {
        setImageUploadStep("Step 6: Saving product changes...");
        await editProduct({
          _id: editingId,
          ...productData,
          badge: productData.badge || undefined,
        } as Product);

        const imageWasUpdated =
          Boolean(originalImageUrl) && productData.image !== originalImageUrl;
        const shouldDeletePreviousImage =
          imageWasUpdated &&
          Boolean(originalImageKey) &&
          originalImageKey !== uploadedImageKey;

        if (shouldDeletePreviousImage) {
          try {
            setImageDeleting(true);
            setImageUploadStep(
              "Step 7: Removing the previous saved image from storage..."
            );
            await deleteUploadedImageApi(originalImageKey);
            setImageUploadStep(
              "Step 8: Product updated and previous image removed."
            );
            showToast(
              "Product updated and previous image removed.",
              "success"
            );
          } catch (cleanupErr) {
            console.error("Failed to delete previous product image:", cleanupErr);
            setImageUploadStep(
              "Product updated, but the previous image could not be removed."
            );
            showToast(
              "Product updated, but the previous image could not be removed.",
              "error"
            );
          } finally {
            setImageDeleting(false);
          }
        } else {
          showToast("Product updated successfully.", "success");
        }
      }

      await getProducts();
      setModalMode(null);
      setFormErrors({});
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? "Failed to save product.";
      showToast(msg, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteProductApi(deleteTarget._id);
      await getProducts();
      setDeleteTarget(null);
      showToast("Product deleted successfully.", "success");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ?? "Failed to delete product.";
      showToast(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  
  const set = (field: keyof Omit<Product, "_id">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  return (
    <div>
      
      {toast && <Toast message={toast.message} type={toast.type} />}

      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2D5016",
              margin: 0,
              fontSize: "1.3rem",
            }}
          >
            Product Management
          </h2>
          <p style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.82rem" }}>
            {products.length} products in catalogue
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: loading ? "#A8C580" : "#2D5016",
            color: "#FAF6EE",
            border: "none",
            padding: "10px 20px",
            borderRadius: "50px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.88rem",
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      
      <div
        style={{
          backgroundColor: "#FAF6EE",
          border: "1px solid rgba(45,80,22,0.1)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8B5E3C",
            }}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: "10px",
              border: "1px solid rgba(45,80,22,0.2)",
              backgroundColor: "#F0EDE6",
              color: "#2D5016",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                backgroundColor:
                  categoryFilter === cat ? "#2D5016" : "transparent",
                color: categoryFilter === cat ? "#FAF6EE" : "#6B4423",
                border: `1px solid ${
                  categoryFilter === cat ? "#2D5016" : "rgba(45,80,22,0.2)"
                }`,
                padding: "6px 14px",
                borderRadius: "50px",
                fontSize: "0.8rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      
      <div
        style={{
          backgroundColor: "#FAF6EE",
          border: "1px solid rgba(45,80,22,0.1)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
        }}
      >
        
        {loading && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                border: "3px solid rgba(45,80,22,0.15)",
                borderTopColor: "#2D5016",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 10px",
              }}
            />
            <p style={{ color: "#8B5E3C", fontSize: "0.85rem", margin: 0 }}>
              Loading products...
            </p>
          </div>
        )}

        {!loading && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(45,80,22,0.06)",
                    borderBottom: "1px solid rgba(45,80,22,0.1)",
                  }}
                >
                  {["Product", "Category", "Price", "Badge", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          color: "#2D5016",
                          fontSize: "0.78rem",
                          letterSpacing: "0.05em",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <tr
                    key={product._id.toString()}
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? "1px solid rgba(45,80,22,0.06)"
                          : "none",
                      transition: "background-color 0.15s",
                    }}
                    className="hover:bg-[rgba(45,80,22,0.02)]"
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <p
                            style={{
                              color: "#2D5016",
                              margin: 0,
                              fontSize: "0.88rem",
                              fontWeight: 500,
                            }}
                          >
                            {product.name}
                          </p>
                          <p
                            style={{
                              color: "#8B5E3C",
                              margin: 0,
                              fontSize: "0.75rem",
                              fontStyle: "italic",
                            }}
                          >
                            {product.sinhalaName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "rgba(45,80,22,0.08)",
                          color: "#2D5016",
                          fontSize: "0.75rem",
                          padding: "3px 10px",
                          borderRadius: "50px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "#2D5016",
                          fontSize: "0.9rem",
                        }}
                      >
                        {product.price}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {product.badge ? (
                        <span
                          style={{
                            backgroundColor: "rgba(212,160,23,0.15)",
                            color: "#7A5C00",
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: "50px",
                            fontWeight: 600,
                          }}
                        >
                          {product.badge}
                        </span>
                      ) : (
                        <span style={{ color: "#C8D8B0", fontSize: "0.8rem" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => openEdit(product)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid rgba(45,80,22,0.2)",
                            backgroundColor: "rgba(45,80,22,0.06)",
                            color: "#2D5016",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid rgba(212,24,61,0.2)",
                            backgroundColor: "rgba(212,24,61,0.06)",
                            color: "#D4183D",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center" }}>
                      <Package
                        size={32}
                        style={{
                          color: "#C8D8B0",
                          margin: "0 auto 8px",
                          display: "block",
                        }}
                      />
                      <p style={{ color: "#A8C580", margin: 0, fontSize: "0.9rem" }}>
                        {search || categoryFilter !== "All"
                          ? "No products match your search."
                          : "No products yet. Click 'Add Product' to get started."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      {modalMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14,26,8,0.75)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "24px",
            overflowY: "auto",
          }}
          onClick={(e) => e.target === e.currentTarget && setModalMode(null)}
        >
          <div
            style={{
              backgroundColor: "#FAF6EE",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "680px",
              boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
              overflow: "hidden",
              margin: "auto",
            }}
          >
            
            <div
              style={{
                background: "linear-gradient(135deg, #2D5016, #4A7C23)",
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#FAF6EE",
                  margin: 0,
                  fontSize: "1.15rem",
                }}
              >
                {modalMode === "add" ? "Add New Product" : "Edit Product"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(250,246,238,0.7)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            
            <div
              style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Product Name"
                  value={formData.name}
                  onChange={(v) => set("name", v)}
                  placeholder="e.g. Rajapura Herbal Tea"
                  required
                  error={formErrors.name}
                />
                <InputField
                  label="Sinhala Name"
                  value={formData.sinhalaName}
                  onChange={(v) => set("sinhalaName", v)}
                  placeholder="e.g. රාජපුර ඖෂධ තේ"
                  required
                  error={formErrors.sinhalaName}
                />
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#2D5016",
                      fontSize: "0.82rem",
                      marginBottom: "6px",
                    }}
                  >
                    Category <span style={{ color: "#D4183D" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.category}
                      onChange={(e) => set("category", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 14px",
                        borderRadius: "10px",
                        border: `1.5px solid ${formErrors.category ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
                        backgroundColor: "#FAF6EE",
                        color: "#2D5016",
                        fontSize: "0.88rem",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#8B5E3C",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  <FieldError message={formErrors.category} />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#2D5016",
                      fontSize: "0.82rem",
                      marginBottom: "6px",
                    }}
                  >
                    Badge
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.badge ?? ""}
                      onChange={(e) => set("badge", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid rgba(45,80,22,0.2)",
                        backgroundColor: "#FAF6EE",
                        color: "#2D5016",
                        fontSize: "0.88rem",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      {BADGES.map((b) => (
                        <option key={b} value={b}>
                          {b || "— None —"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#8B5E3C",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  <FieldError message={formErrors.badge} />
                </div>
              </div>

              
              <InputField
                label="Price (LKR)"
                value={formData.price}
                onChange={(v) => {
                  const numeric = v.replace(/[^0-9]/g, "");
                  const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  set("price", numeric ? `LKR ${formatted}` : "");
                }}
                placeholder="e.g. LKR 850"
                required
                error={formErrors.price}
              />

              
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#2D5016",
                    fontSize: "0.82rem",
                    marginBottom: "6px",
                  }}
                >
                  Description <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `1.5px solid ${formErrors.description ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
                    backgroundColor: formErrors.description
                      ? "rgba(212,24,61,0.04)"
                      : "#FAF6EE",
                    color: "#2D5016",
                    fontSize: "0.88rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "'Lato', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
                <FieldError message={formErrors.description} />
              </div>

              
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#2D5016",
                    fontSize: "0.82rem",
                    marginBottom: "6px",
                  }}
                >
                  Product Image <span style={{ color: "#D4183D" }}>*</span>
                </label>
                <div
                  style={{
                    border: `1.5px solid ${formErrors.image ? "#D4183D" : "rgba(45,80,22,0.2)"}`,
                    borderRadius: "14px",
                    backgroundColor: formErrors.image
                      ? "rgba(212,24,61,0.04)"
                      : "rgba(45,80,22,0.03)",
                    padding: "14px",
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                        borderRadius: "12px",
                        border: "1px solid rgba(45,80,22,0.15)",
                        backgroundColor: "#F0EDE6",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8B5E3C",
                      }}
                    >
                      {selectedImagePreview || formData.image ? (
                        <img
                          src={selectedImagePreview || formData.image}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <ImagePlus size={30} />
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          width: "100%",
                          minHeight: "132px",
                          border: "1px dashed rgba(74,124,35,0.45)",
                          borderRadius: "12px",
                          backgroundColor: "#FAF6EE",
                          padding: "18px",
                          color: "#2D5016",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          textAlign: "center",
                          boxSizing: "border-box",
                        }}
                      >
                        <UploadCloud size={34} style={{ color: "#2D5016" }} />
                        <div>
                          <p
                            style={{
                              color: "#2D5016",
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {selectedImageFile
                              ? selectedImageFile.name
                              : "Drop an image here or choose a file"}
                          </p>
                          <p
                            style={{
                              color: "#8B5E3C",
                              fontSize: "0.76rem",
                              margin: "2px 0 0",
                            }}
                          >
                            {selectedImageFile
                              ? "Ready to upload"
                              : "Images up to 4MB"}
                          </p>
                        </div>

                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleImageFileSelect(e.target.files?.[0])
                          }
                        />

                        {!selectedImageFile ? (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={imageUploading || imageDeleting}
                            style={{
                              minWidth: "138px",
                              minHeight: "38px",
                              padding: "8px 18px",
                              borderRadius: "999px",
                              border: "none",
                              backgroundColor:
                                imageUploading || imageDeleting
                                  ? "#C8D8B0"
                                  : "#8B5E3C",
                              color: "#FAF6EE",
                              cursor:
                                imageUploading || imageDeleting
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "0.84rem",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "7px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <ImagePlus size={15} /> Select Image
                          </button>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={handleUploadSelectedImage}
                              disabled={isUploading || imageUploading || imageDeleting}
                              style={{
                                minWidth: "138px",
                                minHeight: "38px",
                                padding: "8px 18px",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor:
                                  isUploading || imageUploading || imageDeleting
                                    ? "#A8C580"
                                    : "#2D5016",
                                color: "#FAF6EE",
                                cursor:
                                  isUploading || imageUploading || imageDeleting
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "0.84rem",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <UploadCloud size={15} />
                              {imageDeleting
                                ? "Deleting..."
                                : imageUploading || isUploading
                                ? "Uploading..."
                                : "Upload Image"}
                            </button>
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              disabled={isUploading || imageUploading || imageDeleting}
                              style={{
                                minWidth: "138px",
                                minHeight: "38px",
                                padding: "8px 18px",
                                borderRadius: "999px",
                                border: "1px solid rgba(139,94,60,0.35)",
                                backgroundColor: "transparent",
                                color: "#6B4423",
                                cursor:
                                  isUploading || imageUploading || imageDeleting
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "0.84rem",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <RefreshCw size={14} /> Change Image
                            </button>
                            <button
                              type="button"
                              onClick={resetSelectedImage}
                              disabled={isUploading || imageUploading || imageDeleting}
                              style={{
                                minWidth: "138px",
                                minHeight: "38px",
                                padding: "8px 18px",
                                borderRadius: "999px",
                                border: "1px solid rgba(212,24,61,0.25)",
                                backgroundColor: "rgba(212,24,61,0.06)",
                                color: "#D4183D",
                                cursor:
                                  isUploading || imageUploading || imageDeleting
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "0.84rem",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <X size={14} /> Clear Selected
                            </button>
                          </div>
                        )}
                      </div>

                      <p
                        style={{
                          color: imageDeleting || imageUploading ? "#2D5016" : "#8B5E3C",
                          fontSize: "0.78rem",
                          margin: "10px 0 0",
                          fontWeight: imageDeleting || imageUploading ? 700 : 400,
                        }}
                      >
                        {imageUploadStep}
                      </p>

                      {(imageUploading || imageDeleting) && (
                        <div style={{ marginTop: "10px" }}>
                          <div
                            style={{
                              height: "8px",
                              borderRadius: "999px",
                              backgroundColor: "rgba(45,80,22,0.12)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${uploadProgress}%`,
                                height: "100%",
                                borderRadius: "999px",
                                backgroundColor: "#4A7C23",
                                transition: "width 0.15s ease",
                              }}
                            />
                          </div>
                          <p
                            style={{
                              color: "#8B5E3C",
                              fontSize: "0.76rem",
                              margin: "6px 0 0",
                            }}
                          >
                            {imageDeleting
                              ? "Deleting previous image..."
                              : `Uploading ${Math.round(uploadProgress)}%`}
                          </p>
                        </div>
                      )}

                      {formData.image && (
                        <input
                          value={formData.image}
                          onChange={(e) => set("image", e.target.value)}
                          placeholder="Uploaded image URL"
                          style={{
                            width: "100%",
                            marginTop: "10px",
                            padding: "9px 12px",
                            borderRadius: "10px",
                            border: "1px solid rgba(45,80,22,0.15)",
                            backgroundColor: "#F0EDE6",
                            color: "#2D5016",
                            fontSize: "0.78rem",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <FieldError message={formErrors.image} />
              </div>

              
              <TagsField
                label="Benefits"
                values={formData.benefits}
                onChange={(v) => set("benefits", v)}
                placeholder="e.g. Improves digestion"
              />
              <TagsField
                label="Ingredients"
                values={formData.ingredients}
                onChange={(v) => set("ingredients", v)}
                placeholder="e.g. Ginger"
              />
              <TagsField
                label="How to Use Steps"
                values={formData.howToUse ?? [""]}
                onChange={(v) => set("howToUse", v)}
                placeholder="e.g. Mix 1 teaspoon in warm water..."
              />
            </div>

            
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid rgba(45,80,22,0.1)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                backgroundColor: "rgba(45,80,22,0.02)",
              }}
            >
              <button
                onClick={() => { setModalMode(null); setFormErrors({}); }}
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "1px solid rgba(45,80,22,0.2)",
                  backgroundColor: "transparent",
                  color: "#6B4423",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: saveLoading ? "#A8C580" : "#2D5016",
                  color: "#FAF6EE",
                  cursor: saveLoading ? "not-allowed" : "pointer",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Save size={15} />
                {saveLoading
                  ? "Saving..."
                  : modalMode === "add"
                  ? "Add Product"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14,26,8,0.75)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FAF6EE",
              borderRadius: "20px",
              maxWidth: "400px",
              width: "100%",
              padding: "32px",
              textAlign: "center",
              boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(212,24,61,0.1)",
                border: "2px solid rgba(212,24,61,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertTriangle size={24} style={{ color: "#D4183D" }} />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2D5016",
                marginBottom: "8px",
              }}
            >
              Delete Product?
            </h3>
            <p
              style={{
                color: "#5C4033",
                fontSize: "0.88rem",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot be
              undone.
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "1px solid rgba(45,80,22,0.2)",
                  backgroundColor: "transparent",
                  color: "#6B4423",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: deleteLoading ? "#e8738a" : "#D4183D",
                  color: "#FAF6EE",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Trash2 size={14} />
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
