import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight, X, Save,
  MapPin, Phone, Clock, Store, AlertTriangle, Home, Wand2,
  ArrowLeft, ArrowRight, Check,
} from "lucide-react";
import axios from "axios";

type ShopType = "Ayurvedic Store" | "Pharmacy" | "Health Center" | "Supermarket";

interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: ShopType;
}

interface Town {
  name: string;
  shops: Shop[];
}

interface District {
  name: string;
  towns: Town[];
}

interface Province {
  name: string;
  icon: string;
  districts: District[];
}

const SHOP_TYPES: ShopType[] = [
  "Ayurvedic Store",
  "Pharmacy",
  "Health Center",
  "Supermarket",
];

export default function AdminStores() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [shopForm, setShopForm] = useState<Omit<Shop, "id">>({
    name: "",
    address: "",
    phone: "",
    hours: "",
    type: "Ayurvedic Store",
  });

  // ───────────────────────────────────────────────
  // FETCH STORES
  // ───────────────────────────────────────────────
  const fetchStores = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/stores-all`
      );

      console.log(res);

      setProvinces(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // ───────────────────────────────────────────────
  // API CALLS
  // ───────────────────────────────────────────────
  const addStoreAPI = async (
    province: string,
    icon: string,
    district: string,
    town: string,
    shop: Omit<Shop, "id">
  ) => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-store`, {
      province,
      provinceIcon: icon,
      district,
      town,
      shop,
    });
    await fetchStores();
  };

  const updateStoreAPI = async (shopId: number, updatedShop: any) => {
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-store`, {
      shopId,
      updatedShop,
    });
    await fetchStores();
  };

  const deleteStoreAPI = async (shopId: number) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-store`, {
      data: { shopId },
    });
    await fetchStores();
  };

  // ───────────────────────────────────────────────
  // SAVE SHOP
  // ───────────────────────────────────────────────
  const saveShop = async () => {
    if (!shopForm.name || !shopForm.address) return;

    if (modal?.type === "add") {
      const { p, d, t } = modal;

      await addStoreAPI(
        provinces[p].name,
        provinces[p].icon,
        provinces[p].districts[d].name,
        provinces[p].districts[d].towns[t].name,
        shopForm
      );
    }

    if (modal?.type === "edit") {
      const shop =
        provinces[modal.p].districts[modal.d].towns[modal.t].shops[modal.s];

      await updateStoreAPI(shop.id, shopForm);
    }

    setModal(null);
  };

  // ───────────────────────────────────────────────
  // DELETE SHOP
  // ───────────────────────────────────────────────
  const deleteShop = (p: number, d: number, t: number, s: number) => {
    const shop = provinces[p].districts[d].towns[t].shops[s];

    setDeleteTarget({
      name: shop.name,
      action: async () => {
        await deleteStoreAPI(shop.id);
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Store Management</h2>

      {provinces.map((prov, pIndex) => (
        <div key={prov.name}>
          <h3>{prov.icon} {prov.name}</h3>

          {prov.districts.map((dist, dIndex) => (
            <div key={dist.name} style={{ marginLeft: "20px" }}>
              <h4>{dist.name}</h4>

              {dist.towns.map((town, tIndex) => (
                <div key={town.name} style={{ marginLeft: "20px" }}>
                  <h5>{town.name}</h5>

                  {town.shops.map((shop, sIndex) => (
                    <div key={shop.id} style={{ marginLeft: "20px" }}>
                      <b>{shop.name}</b> ({shop.type})
                      <br />
                      {shop.address}
                      <br />

                      <button
                        onClick={() => {
                          setShopForm({ ...shop });
                          setModal({ type: "edit", p: pIndex, d: dIndex, t: tIndex, s: sIndex });
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteShop(pIndex, dIndex, tIndex, sIndex)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setShopForm({
                        name: "",
                        address: "",
                        phone: "",
                        hours: "",
                        type: "Ayurvedic Store",
                      });
                      setModal({ type: "add", p: pIndex, d: dIndex, t: tIndex });
                    }}
                  >
                    + Add Shop
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* SIMPLE MODAL */}
      {modal && (
        <div style={{ background: "#0008", position: "fixed", inset: 0 }}>
          <div style={{ background: "#fff", padding: "20px", margin: "100px auto", width: "300px" }}>
            <input
              placeholder="Name"
              value={shopForm.name}
              onChange={(e) =>
                setShopForm({ ...shopForm, name: e.target.value })
              }
            />
            <input
              placeholder="Address"
              value={shopForm.address}
              onChange={(e) =>
                setShopForm({ ...shopForm, address: e.target.value })
              }
            />

            <button onClick={saveShop}>Save</button>
            <button onClick={() => setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div style={{ background: "#0008", position: "fixed", inset: 0 }}>
          <div style={{ background: "#fff", padding: "20px", margin: "100px auto", width: "300px" }}>
            <p>Delete {deleteTarget.name}?</p>
            <button onClick={deleteTarget.action}>Yes</button>
            <button onClick={() => setDeleteTarget(null)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}