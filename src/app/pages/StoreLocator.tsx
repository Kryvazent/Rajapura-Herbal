import { useState } from "react";
import { MapPin, Phone, Clock, ChevronRight, ChevronDown, Leaf, Store } from "lucide-react";
import { getProvinces } from "../admin/adminData";
import type { Province, District, Town, Shop } from "../data/stores";

const typeColors: Record<Shop["type"], { bg: string; text: string; icon: string }> = {
  "Ayurvedic Store": { bg: "rgba(45,80,22,0.1)", text: "#2D5016", icon: "🌿" },
  Pharmacy: { bg: "rgba(30,90,160,0.1)", text: "#1E5AA0", icon: "💊" },
  "Health Center": { bg: "rgba(130,50,200,0.1)", text: "#823200", icon: "🏥" },
  Supermarket: { bg: "rgba(212,160,23,0.15)", text: "#7A5C00", icon: "🛒" },
};

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div style={{ padding: "32px 20px", textAlign: "center" }}>
      <div style={{ color: "#C8D8B0", margin: "0 auto 10px", display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ color: "#A8C580", fontSize: "0.84rem", margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

interface PanelProps {
  active: boolean;
  color: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}
function Panel({ active, color, icon, title, children }: PanelProps) {
  return (
    <div
      style={{
        backgroundColor: "#FAF6EE",
        border: "1px solid rgba(45,80,22,0.2)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(45,80,22,0.07)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: active ? color : "#A8C580",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          transition: "background-color 0.3s",
        }}
      >
        <span style={{ color: "#FAF6EE", display: "flex" }}>{icon}</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", margin: 0, fontSize: "0.88rem" }}>
          {title}
        </h2>
      </div>
      <div className="overflow-y-auto" style={{ flex: 1, padding: "4px" }}>
        {children}
      </div>
    </div>
  );
}

function SelectionButton({
  isSelected,
  activeColor,
  onClick,
  children,
}: {
  isSelected: boolean;
  activeColor: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 10px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: isSelected ? `${activeColor}18` : "transparent",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}

export default function StoreLocator() {
  const provinces = getProvinces();

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Mobile accordion expansion
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3 | 4>(1);

  const handleProvinceClick = (province: Province) => {
    if (selectedProvince?.name === province.name) {
      setSelectedProvince(null); setSelectedDistrict(null); setSelectedTown(null);
    } else {
      setSelectedProvince(province); setSelectedDistrict(null); setSelectedTown(null);
      setMobileStep(2);
    }
  };

  const handleDistrictClick = (district: District) => {
    if (selectedDistrict?.name === district.name) {
      setSelectedDistrict(null); setSelectedTown(null);
    } else {
      setSelectedDistrict(district); setSelectedTown(null);
      setMobileStep(3);
    }
  };

  const handleTownClick = (town: Town) => {
    if (selectedTown?.name === town.name) {
      setSelectedTown(null);
    } else {
      setSelectedTown(town); setActiveFilter("All");
      setMobileStep(4);
    }
  };

  const filteredShops = selectedTown
    ? activeFilter === "All" ? selectedTown.shops : selectedTown.shops.filter((s) => s.type === activeFilter)
    : [];

  const totalShops = provinces.reduce((a, p) => a + p.districts.reduce((b, d) => b + d.towns.reduce((c, t) => c + t.shops.length, 0), 0), 0);

  const districtShopCount = (district: District) => district.towns.reduce((a, t) => a + t.shops.length, 0);

  const steps = [
    { n: 1, label: "Province", color: "#2D5016", done: !!selectedProvince, value: selectedProvince?.name },
    { n: 2, label: "District", color: "#4A7C23", done: !!selectedDistrict, value: selectedDistrict?.name },
    { n: 3, label: "Town", color: "#8B5E3C", done: !!selectedTown, value: selectedTown?.name },
    { n: 4, label: "Stores", color: "#D4A017", done: false, value: selectedTown ? `${filteredShops.length} found` : undefined },
  ];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Page Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A3009, #2D5016)",
          padding: "clamp(36px, 8vw, 60px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,195,74,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,160,23,0.06) 0%, transparent 50%)" }} />
        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <MapPin size={14} style={{ color: "#D4A017" }} />
            <span style={{ color: "#D4A017", fontSize: "0.72rem", letterSpacing: "0.2em" }}>STORE LOCATOR</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#FAF6EE", fontSize: "clamp(1.8rem, 4vw, 3rem)", margin: 0 }}>
            Find a Store Near You
          </h1>
          <p style={{ color: "#A8C580", marginTop: "12px", maxWidth: "520px", margin: "12px auto 0", lineHeight: 1.7, fontSize: "0.9rem" }}>
            Rajapura products are available at over {totalShops} authorized stores across all 9 provinces of Sri Lanka.
          </p>
        </div>
      </div>

      {/* Decorative band */}
      <div style={{ height: "4px", background: "linear-gradient(to right, #2D5016, #8BC34A, #D4A017, #8BC34A, #2D5016)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-6">

        {/* ── Step Indicator (mobile & tablet) ── */}
        <div
          className="lg:hidden flex items-center mb-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", gap: "0" }}
        >
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center" style={{ flex: i < 3 ? 1 : "none", minWidth: 0 }}>
              <button
                onClick={() => {
                  if (s.n <= (selectedProvince ? selectedDistrict ? selectedTown ? 4 : 3 : 2 : 1)) {
                    setMobileStep(s.n as 1 | 2 | 3 | 4);
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 6px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: s.done ? s.color : mobileStep === s.n ? s.color : "rgba(45,80,22,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: (s.done || mobileStep === s.n) ? "#FAF6EE" : "#A8C580",
                    border: mobileStep === s.n && !s.done ? `2px solid ${s.color}` : "none",
                    transition: "all 0.3s",
                  }}
                >
                  {s.done ? "✓" : s.n}
                </div>
                <span style={{ fontSize: "0.58rem", color: s.done || mobileStep === s.n ? s.color : "#A8C580", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {s.value ? s.value.split(" ")[0].substring(0, 8) : s.label}
                </span>
              </button>
              {i < 3 && <div style={{ flex: 1, height: "2px", backgroundColor: s.done ? s.color : "rgba(45,80,22,0.12)", transition: "background-color 0.3s", minWidth: "12px" }} />}
            </div>
          ))}
        </div>

        {/* ── Desktop: classic 4-column grid ── */}
        <div
          className="hidden lg:grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", height: "calc(100vh - 300px)", minHeight: "440px" }}
        >
          {/* Panel 1 – Province */}
          <Panel active color="#2D5016" icon={<Leaf size={14} />} title="Select Province">
            {provinces.map((province) => {
              const isSelected = selectedProvince?.name === province.name;
              const totalInProv = province.districts.reduce((a, d) => a + d.towns.reduce((b, t) => b + t.shops.length, 0), 0);
              return (
                <SelectionButton key={province.name} isSelected={isSelected} activeColor="#2D5016" onClick={() => handleProvinceClick(province)}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "1.05rem" }}>{province.icon}</span>
                    <div>
                      <p style={{ color: isSelected ? "#2D5016" : "#3B2314", margin: 0, fontSize: "0.82rem", fontWeight: isSelected ? 700 : 400 }}>{province.name}</p>
                      <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.64rem" }}>{province.districts.length} dist · {totalInProv} stores</p>
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: isSelected ? "#2D5016" : "#A8C580", transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                </SelectionButton>
              );
            })}
          </Panel>

          {/* Panel 2 – District */}
          <Panel active={!!selectedProvince} color="#4A7C23" icon={<MapPin size={14} />} title={selectedProvince ? selectedProvince.name : "Select Province First"}>
            {!selectedProvince ? (
              <EmptyState icon={<MapPin size={28} />} message="Select a province to see districts." />
            ) : (
              selectedProvince.districts.map((district) => {
                const isSelected = selectedDistrict?.name === district.name;
                const sc = districtShopCount(district);
                return (
                  <SelectionButton key={district.name} isSelected={isSelected} activeColor="#4A7C23" onClick={() => handleDistrictClick(district)}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: isSelected ? "#4A7C23" : "#C8D8B0", flexShrink: 0 }} />
                      <div>
                        <p style={{ color: isSelected ? "#2D5016" : "#3B2314", margin: 0, fontSize: "0.82rem", fontWeight: isSelected ? 700 : 400 }}>{district.name}</p>
                        <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.64rem" }}>{district.towns.length} towns · {sc} stores</p>
                      </div>
                    </div>
                    <ChevronRight size={13} style={{ color: isSelected ? "#4A7C23" : "#A8C580", transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                  </SelectionButton>
                );
              })
            )}
          </Panel>

          {/* Panel 3 – Town */}
          <Panel active={!!selectedDistrict} color="#8B5E3C" icon={<MapPin size={14} />} title={selectedDistrict ? `${selectedDistrict.name} Towns` : "Select District First"}>
            {!selectedDistrict ? (
              <EmptyState icon={<MapPin size={28} />} message="Select a district to see towns." />
            ) : (
              selectedDistrict.towns.map((town) => {
                const isSelected = selectedTown?.name === town.name;
                return (
                  <SelectionButton key={town.name} isSelected={isSelected} activeColor="#8B5E3C" onClick={() => handleTownClick(town)}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: isSelected ? "#8B5E3C" : "#C8D8B0", flexShrink: 0 }} />
                      <div>
                        <p style={{ color: isSelected ? "#5C3D20" : "#3B2314", margin: 0, fontSize: "0.82rem", fontWeight: isSelected ? 700 : 400 }}>{town.name}</p>
                        <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.64rem" }}>{town.shops.length} store{town.shops.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <ChevronRight size={13} style={{ color: isSelected ? "#8B5E3C" : "#A8C580", transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                  </SelectionButton>
                );
              })
            )}
          </Panel>

          {/* Panel 4 – Stores */}
          <Panel active={!!selectedTown} color="#D4A017" icon={<Store size={14} />} title={selectedTown ? `Stores in ${selectedTown.name}` : "Select Town First"}>
            {!selectedTown ? (
              <EmptyState icon={<Store size={28} />} message="Select a town to view stores." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ padding: "6px 4px 0", display: "flex", gap: "4px", flexWrap: "wrap", flexShrink: 0 }}>
                  {["All", "Ayurvedic Store", "Pharmacy", "Health Center", "Supermarket"].map((f) => (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{ backgroundColor: activeFilter === f ? "#2D5016" : "transparent", color: activeFilter === f ? "#FAF6EE" : "#6B4423", border: `1px solid ${activeFilter === f ? "#2D5016" : "rgba(45,80,22,0.2)"}`, padding: "2px 7px", borderRadius: "50px", fontSize: "0.6rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {f}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "4px" }}>
                  {filteredShops.length === 0 ? (
                    <p style={{ color: "#A8C580", fontSize: "0.8rem", padding: "16px", textAlign: "center" }}>No stores match this filter.</p>
                  ) : (
                    filteredShops.map((shop) => <ShopCard key={shop.id} shop={shop} />)
                  )}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Mobile / Tablet: accordion step-by-step ── */}
        <div className="lg:hidden flex flex-col gap-3">

          {/* Step 1 – Province */}
          <MobileAccordion
            step={1}
            title="Province"
            subtitle={selectedProvince?.name ?? "Select a province"}
            color="#2D5016"
            active={mobileStep === 1}
            complete={!!selectedProvince}
            onToggle={() => setMobileStep(mobileStep === 1 ? 1 : 1)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
              {provinces.map((province) => {
                const isSelected = selectedProvince?.name === province.name;
                const totalInProv = province.districts.reduce((a, d) => a + d.towns.reduce((b, t) => b + t.shops.length, 0), 0);
                return (
                  <button
                    key={province.name}
                    onClick={() => handleProvinceClick(province)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid #2D5016" : "1px solid rgba(45,80,22,0.2)",
                      backgroundColor: isSelected ? "rgba(45,80,22,0.1)" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{province.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: isSelected ? "#2D5016" : "#3B2314", margin: 0, fontSize: "0.85rem", fontWeight: isSelected ? 700 : 400 }}>{province.name}</p>
                      <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.68rem" }}>{province.districts.length} districts · {totalInProv} stores</p>
                    </div>
                    {isSelected && <ChevronRight size={14} style={{ color: "#2D5016", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </MobileAccordion>

          {/* Step 2 – District */}
          {selectedProvince && (
            <MobileAccordion
              step={2}
              title="District"
              subtitle={selectedDistrict?.name ?? `Choose a district in ${selectedProvince.name}`}
              color="#4A7C23"
              active={mobileStep === 2}
              complete={!!selectedDistrict}
              onToggle={() => setMobileStep(2)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                {selectedProvince.districts.map((district) => {
                  const isSelected = selectedDistrict?.name === district.name;
                  const sc = districtShopCount(district);
                  return (
                    <button
                      key={district.name}
                      onClick={() => handleDistrictClick(district)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        border: isSelected ? "2px solid #4A7C23" : "1px solid rgba(45,80,22,0.2)",
                        backgroundColor: isSelected ? "rgba(74,124,35,0.1)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isSelected ? "#4A7C23" : "#C8D8B0", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: isSelected ? "#2D5016" : "#3B2314", margin: 0, fontSize: "0.85rem", fontWeight: isSelected ? 700 : 400 }}>{district.name}</p>
                        <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.68rem" }}>{district.towns.length} towns · {sc} stores</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </MobileAccordion>
          )}

          {/* Step 3 – Town */}
          {selectedDistrict && (
            <MobileAccordion
              step={3}
              title="Town"
              subtitle={selectedTown?.name ?? `Choose a town in ${selectedDistrict.name}`}
              color="#8B5E3C"
              active={mobileStep === 3}
              complete={!!selectedTown}
              onToggle={() => setMobileStep(3)}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                {selectedDistrict.towns.map((town) => {
                  const isSelected = selectedTown?.name === town.name;
                  return (
                    <button
                      key={town.name}
                      onClick={() => handleTownClick(town)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "12px",
                        border: isSelected ? "2px solid #8B5E3C" : "1px solid rgba(139,94,60,0.25)",
                        backgroundColor: isSelected ? "rgba(139,94,60,0.1)" : "white",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <p style={{ color: isSelected ? "#5C3D20" : "#3B2314", margin: 0, fontSize: "0.82rem", fontWeight: isSelected ? 700 : 400 }}>{town.name}</p>
                      <p style={{ color: "#8B5E3C", margin: 0, fontSize: "0.66rem" }}>{town.shops.length} store{town.shops.length !== 1 ? "s" : ""}</p>
                    </button>
                  );
                })}
              </div>
            </MobileAccordion>
          )}

          {/* Step 4 – Stores */}
          {selectedTown && (
            <MobileAccordion
              step={4}
              title={`Stores in ${selectedTown.name}`}
              subtitle={`${filteredShops.length} store${filteredShops.length !== 1 ? "s" : ""} found`}
              color="#D4A017"
              active={mobileStep === 4}
              complete={false}
              onToggle={() => setMobileStep(4)}
            >
              <div style={{ padding: "8px" }}>
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {["All", "Ayurvedic Store", "Pharmacy", "Health Center", "Supermarket"].map((f) => (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{ backgroundColor: activeFilter === f ? "#2D5016" : "transparent", color: activeFilter === f ? "#FAF6EE" : "#6B4423", border: `1px solid ${activeFilter === f ? "#2D5016" : "rgba(45,80,22,0.2)"}`, padding: "4px 10px", borderRadius: "50px", fontSize: "0.72rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {f}
                    </button>
                  ))}
                </div>
                {filteredShops.length === 0 ? (
                  <p style={{ color: "#A8C580", fontSize: "0.82rem", textAlign: "center", padding: "16px" }}>No stores match this filter.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredShops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
                  </div>
                )}
              </div>
            </MobileAccordion>
          )}
        </div>

        {/* Summary Bar */}
        {selectedTown && (
          <div
            style={{
              marginTop: "16px",
              backgroundColor: "rgba(45,80,22,0.06)",
              border: "1px solid rgba(45,80,22,0.15)",
              borderRadius: "14px",
              padding: "12px 18px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ color: "#2D5016", margin: 0, fontSize: "0.84rem" }}>
                <strong>{filteredShops.length} store{filteredShops.length !== 1 ? "s" : ""}</strong> in{" "}
                <strong>{selectedTown.name}, {selectedDistrict?.name}, {selectedProvince?.name}</strong>
              </p>
              <p style={{ color: "#8B5E3C", margin: "2px 0 0", fontSize: "0.72rem" }}>
                All authorized stores carry the full Rajapura range.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeColors).map(([type, style]) => {
                const count = selectedTown.shops.filter((s) => s.type === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} style={{ backgroundColor: style.bg, color: style.text, padding: "3px 10px", borderRadius: "50px", fontSize: "0.7rem" }}>
                    {style.icon} {count} {type}{count !== 1 ? "s" : ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shop Card ──────────────────────────────────────────────────────────────────
function ShopCard({ shop }: { shop: Shop }) {
  const typeStyle = typeColors[shop.type];
  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "12px 14px", border: "1px solid rgba(45,80,22,0.1)", boxShadow: "0 2px 6px rgba(45,80,22,0.05)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2D5016", fontSize: "0.88rem", margin: 0, lineHeight: 1.3 }}>
          {shop.name}
        </h3>
        <span style={{ backgroundColor: typeStyle.bg, color: typeStyle.text, fontSize: "0.62rem", padding: "2px 7px", borderRadius: "50px", whiteSpace: "nowrap", flexShrink: 0 }}>
          {typeStyle.icon} {shop.type}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div className="flex gap-2">
          <MapPin size={11} style={{ color: "#8B5E3C", marginTop: "2px", flexShrink: 0 }} />
          <span style={{ color: "#5C4033", fontSize: "0.74rem", lineHeight: 1.4 }}>{shop.address}</span>
        </div>
        <div className="flex gap-2">
          <Phone size={11} style={{ color: "#8B5E3C", flexShrink: 0, marginTop: "2px" }} />
          <span style={{ color: "#5C4033", fontSize: "0.74rem" }}>{shop.phone}</span>
        </div>
        <div className="flex gap-2">
          <Clock size={11} style={{ color: "#8B5E3C", flexShrink: 0, marginTop: "2px" }} />
          <span style={{ color: "#5C4033", fontSize: "0.74rem" }}>{shop.hours}</span>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Accordion ──────────────────────────────────────────────────────────
function MobileAccordion({
  step,
  title,
  subtitle,
  color,
  active,
  complete,
  onToggle,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  color: string;
  active: boolean;
  complete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FAF6EE",
        border: `1px solid ${active || complete ? color + "40" : "rgba(45,80,22,0.15)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: active ? "0 4px 20px rgba(45,80,22,0.12)" : "0 2px 8px rgba(45,80,22,0.05)",
        transition: "all 0.3s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          backgroundColor: active ? `${color}12` : complete ? `${color}08` : "transparent",
          transition: "background-color 0.2s",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: complete ? color : active ? color : "rgba(45,80,22,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: complete || active ? "#FAF6EE" : "#8B5E3C",
            fontSize: "0.8rem",
            fontWeight: 700,
            transition: "all 0.3s",
          }}
        >
          {complete && !active ? "✓" : step}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: active ? color : complete ? color : "#8B5E3C", margin: 0, fontSize: "0.8rem", letterSpacing: "0.06em" }}>
            STEP {step}
          </p>
          <p style={{ color: "#2D5016", margin: 0, fontSize: "0.9rem", fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
            {!active && subtitle !== title && <span style={{ color: "#8B5E3C", fontWeight: 400 }}> — {subtitle}</span>}
          </p>
        </div>
        {active ? (
          <ChevronDown size={16} style={{ color: color, flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ color: "#A8C580", flexShrink: 0 }} />
        )}
      </button>

      {active && (
        <div style={{ borderTop: `1px solid ${color}25` }}>
          {children}
        </div>
      )}
    </div>
  );
}
