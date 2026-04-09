import { useState } from "react";
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
} from "lucide-react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "./adminData";
import type { Product } from "../data/products";

const CATEGORIES = [
  "Teas & Infusions",
  "Oils & Serums",
  "Supplements",
  "Skincare",
  "Powders & Blends",
  "Tonics & Syrups",
];

const BADGES = ["", "Bestseller", "Premium", "New", "Organic"];

const emptyForm = (): Omit<Product, "id"> => ({
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", color: "#2D5016", fontSize: "0.82rem", marginBottom: "6px" }}>
        {label} {required && <span style={{ color: "#D4183D" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1.5px solid rgba(45,80,22,0.2)",
          backgroundColor: "#FAF6EE",
          color: "#2D5016",
          fontSize: "0.88rem",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function TagsField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
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
      <label style={{ display: "block", color: "#2D5016", fontSize: "0.82rem", marginBottom: "6px" }}>
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
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const refresh = () => setProducts(getProducts());

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setFormData(emptyForm());
    setEditingId(null);
    setModalMode("add");
  };

  const openEdit = (product: Product) => {
    const { id, ...rest } = product;
    setFormData({ ...rest, benefits: [...rest.benefits], ingredients: [...rest.ingredients], howToUse: [...(rest.howToUse ?? [])] });
    setEditingId(id);
    setModalMode("edit");
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.image || !formData.description) return;
    if (modalMode === "add") {
      addProduct({ ...formData, badge: formData.badge || undefined });
    } else if (editingId !== null) {
      updateProduct({ id: editingId, ...formData, badge: formData.badge || undefined });
    }
    refresh();
    setModalMode(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
  };

  const set = (field: keyof Omit<Product, "id">, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      {/* Header row */}
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#2D5016",
            color: "#FAF6EE",
            border: "none",
            padding: "10px 20px",
            borderRadius: "50px",
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
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
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8B5E3C" }} />
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
                backgroundColor: categoryFilter === cat ? "#2D5016" : "transparent",
                color: categoryFilter === cat ? "#FAF6EE" : "#6B4423",
                border: `1px solid ${categoryFilter === cat ? "#2D5016" : "rgba(45,80,22,0.2)"}`,
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

      {/* Table */}
      <div
        style={{
          backgroundColor: "#FAF6EE",
          border: "1px solid rgba(45,80,22,0.1)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(45,80,22,0.06)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(45,80,22,0.06)", borderBottom: "1px solid rgba(45,80,22,0.1)" }}>
                {["Product", "Category", "Price", "Badge", "Actions"].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(45,80,22,0.06)" : "none",
                    transition: "background-color 0.15s",
                  }}
                  className="hover:bg-[rgba(45,80,22,0.02)]"
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ color: "#2D5016", margin: 0, fontSize: "0.88rem", fontWeight: 500 }}>
                          {product.name}
                        </p>
                        <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.75rem", fontStyle: "italic" }}>
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
                    <span style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "0.9rem" }}>
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
                      <span style={{ color: "#C8D8B0", fontSize: "0.8rem" }}>—</span>
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
                    <Package size={32} style={{ color: "#C8D8B0", margin: "0 auto 8px", display: "block" }} />
                    <p style={{ color: "#A8C580", margin: 0, fontSize: "0.9rem" }}>No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
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
            {/* Modal header */}
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
                style={{ background: "none", border: "none", color: "rgba(250,246,238,0.7)", cursor: "pointer", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form body */}
            <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Product Name" value={formData.name} onChange={(v) => set("name", v)} placeholder="e.g. Rajapura Herbal Tea" required />
                <InputField label="Sinhala Name" value={formData.sinhalaName} onChange={(v) => set("sinhalaName", v)} placeholder="e.g. රාජපුර ඖෂධ තේ" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label style={{ display: "block", color: "#2D5016", fontSize: "0.82rem", marginBottom: "6px" }}>
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
                        border: "1.5px solid rgba(45,80,22,0.2)",
                        backgroundColor: "#FAF6EE",
                        color: "#2D5016",
                        fontSize: "0.88rem",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#8B5E3C", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Badge */}
                <div>
                  <label style={{ display: "block", color: "#2D5016", fontSize: "0.82rem", marginBottom: "6px" }}>Badge</label>
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
                      {BADGES.map((b) => <option key={b} value={b}>{b || "— None —"}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#8B5E3C", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>

              <InputField label="Price (LKR)" value={formData.price} onChange={(v) => set("price", v)} placeholder="e.g. LKR 850" required />

              <div>
                <label style={{ display: "block", color: "#2D5016", fontSize: "0.82rem", marginBottom: "6px" }}>
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
                    border: "1.5px solid rgba(45,80,22,0.2)",
                    backgroundColor: "#FAF6EE",
                    color: "#2D5016",
                    fontSize: "0.88rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "'Lato', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <InputField label="Image URL" value={formData.image} onChange={(v) => set("image", v)} placeholder="https://..." required />
              {formData.image && (
                <img src={formData.image} alt="preview" style={{ height: "80px", width: "120px", objectFit: "cover", borderRadius: "10px", border: "1px solid rgba(45,80,22,0.15)" }} />
              )}

              <TagsField label="Benefits" values={formData.benefits} onChange={(v) => set("benefits", v)} placeholder="e.g. Improves digestion" />
              <TagsField label="Ingredients" values={formData.ingredients} onChange={(v) => set("ingredients", v)} placeholder="e.g. Ginger" />
              <TagsField label="How to Use Steps" values={formData.howToUse ?? [""]} onChange={(v) => set("howToUse", v)} placeholder="e.g. Mix 1 teaspoon in warm water..." />
            </div>

            {/* Modal footer */}
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
                onClick={() => setModalMode(null)}
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
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: "#2D5016",
                  color: "#FAF6EE",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Save size={15} /> {modalMode === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", marginBottom: "8px" }}>
              Delete Product?
            </h3>
            <p style={{ color: "#5C4033", fontSize: "0.88rem", marginBottom: "24px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteTarget(null)}
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
                style={{
                  padding: "10px 22px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: "#D4183D",
                  color: "#FAF6EE",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}