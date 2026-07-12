import axios from "axios";
import { Image, LoaderCircle, Pencil, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUploadThing } from "../lib/uploadthing";

interface TeamMember { _id?: string; name: string; title: string; description: string; imageUrl: string; displayOrder: number }
const API = import.meta.env.VITE_BACKEND_URL;
const blank = (): TeamMember => ({ name: "", title: "", description: "", imageUrl: "", displayOrder: 0 });

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const { startUpload } = useUploadThing("serviceImage");

  const load = async () => { try { setLoading(true); const res = await axios.get(`${API}/admin/team`, { withCredentials: true }); setMembers(res.data?.data ?? []); } catch { setMessage("Failed to load team members."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const upload = async (file: File) => { try { setUploading(true); const result: any = await startUpload([file]); const url = result?.[0]?.ufsUrl ?? result?.[0]?.url ?? result?.[0]?.serverData?.url; if (!url) throw new Error(); setForm((current) => current ? { ...current, imageUrl: url } : current); } catch { setMessage("Image upload failed."); } finally { setUploading(false); } };
  const save = async () => { if (!form?.name.trim() || !form.title.trim()) return setMessage("Name and job title are required."); try { setSaving(true); if (form._id) await axios.put(`${API}/admin/team/${form._id}`, form, { withCredentials: true }); else await axios.post(`${API}/admin/team`, form, { withCredentials: true }); setForm(null); setMessage("Team member saved."); await load(); } catch (error: any) { setMessage(error.response?.data?.message ?? "Failed to save team member."); } finally { setSaving(false); } };
  const remove = async (member: TeamMember) => { if (!member._id || !window.confirm(`Delete ${member.name}?`)) return; try { await axios.delete(`${API}/admin/team/${member._id}`, { withCredentials: true }); await load(); } catch { setMessage("Failed to delete team member."); } };
  const field = (label: string, key: keyof TeamMember, textarea = false) => <label style={{ display: "grid", gap: 5, color: "#294d22", fontSize: ".8rem" }}>{label}{textarea ? <textarea rows={4} value={String(form?.[key] ?? "")} onChange={(e) => setForm({ ...form!, [key]: e.target.value })} /> : <input type={key === "displayOrder" ? "number" : "text"} value={String(form?.[key] ?? "")} onChange={(e) => setForm({ ...form!, [key]: key === "displayOrder" ? Number(e.target.value) : e.target.value })} />}</label>;

  return <div style={{ color: "#23431d" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><div><h2 style={{ font: "600 1.35rem 'Playfair Display',serif", margin: 0 }}>Meet the Team</h2><p style={{ color: "#8B5E3C", fontSize: ".82rem" }}>{members.length} team members</p></div><button onClick={() => setForm(blank())} className="admin-team-primary"><Plus size={15}/> Add Team Member</button></div>
    {message && <p style={{ padding: 10, background: "#f3efe4", borderRadius: 8, fontSize: ".8rem" }}>{message}</p>}
    {loading ? <p>Loading...</p> : members.length === 0 ? <div style={{ padding: 60, textAlign: "center", border: "1px dashed #bdc9aa", borderRadius: 16 }}><Image size={35}/><p>No team members yet. The public section is currently hidden.</p></div> : <div style={{ display: "grid", gap: 12 }}>{members.map((member) => <div key={member._id} style={{ display: "flex", gap: 14, alignItems: "center", padding: 14, background: "#fff", border: "1px solid #dce3cf", borderRadius: 13 }}>
      {member.imageUrl ? <img src={member.imageUrl} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%" }}/> : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#2D5016", color: "#9bd14f", display: "grid", placeItems: "center", fontSize: 24 }}>{member.name.charAt(0)}</div>}
      <div style={{ flex: 1 }}><strong>{member.name}</strong><div style={{ color: "#b08424", fontSize: ".78rem" }}>{member.title}</div><small style={{ color: "#71806e" }}>Display order: {member.displayOrder}</small></div><button onClick={() => setForm(member)} className="admin-team-icon"><Pencil size={14}/></button><button onClick={() => remove(member)} className="admin-team-icon danger"><Trash2 size={14}/></button>
    </div>)}</div>}
    {form && <div className="admin-team-modal" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}><div className="admin-team-dialog"><div className="admin-team-dialog-head"><h3>{form._id ? "Edit" : "Add"} Team Member</h3><button onClick={() => setForm(null)}><X size={18}/></button></div><div className="admin-team-fields">
      <div>{form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}/>}<label className="admin-team-upload">{uploading ? <><LoaderCircle size={16}/> Uploading...</> : <><UploadCloud size={16}/> {form.imageUrl ? "Replace photo" : "Upload photo"}</>}<input hidden type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}/></label>{form.imageUrl && <button className="admin-team-remove" onClick={() => setForm({...form,imageUrl:""})}>Remove photo</button>}</div>
      {field("Full name *", "name")}{field("Job title *", "title")}{field("Biography", "description", true)}{field("Display order", "displayOrder")}
    </div><div className="admin-team-actions"><button onClick={() => setForm(null)}>Cancel</button><button className="admin-team-primary" disabled={saving || uploading} onClick={save}><Save size={14}/> {saving ? "Saving..." : "Save"}</button></div></div></div>}
    <style>{`.admin-team-primary{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:30px;padding:10px 17px;background:#2D5016;color:white;cursor:pointer}.admin-team-icon{width:32px;height:32px;border:1px solid #cbd7c3;border-radius:8px;background:#f8fbf6;color:#2D5016;display:grid;place-items:center;cursor:pointer}.admin-team-icon.danger{color:#c72d45;background:#fff5f6}.admin-team-modal{position:fixed;inset:0;background:#10200dc9;z-index:300;display:grid;place-items:center;padding:20px}.admin-team-dialog{width:min(560px,100%);max-height:90vh;overflow:auto;background:#faf6ee;border-radius:18px}.admin-team-dialog-head,.admin-team-actions{padding:17px 22px;display:flex;align-items:center;justify-content:space-between;background:#2D5016;color:white}.admin-team-dialog-head h3{margin:0;font-family:'Playfair Display',serif}.admin-team-dialog-head button{background:none;border:0;color:white}.admin-team-fields{padding:22px;display:grid;gap:13px}.admin-team-fields input,.admin-team-fields textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccd8c5;border-radius:9px;background:white}.admin-team-upload{padding:11px;border:1px dashed #84a176;display:flex;justify-content:center;gap:7px;cursor:pointer}.admin-team-remove{margin-top:7px;border:0;background:none;color:#b3243b}.admin-team-actions{justify-content:flex-end;gap:10px;background:#f3efe6;color:#333}.admin-team-actions>button:first-child{border:1px solid #ccd4c6;background:white;border-radius:30px;padding:9px 17px}`}</style>
  </div>;
}
