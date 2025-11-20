import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  crearAlumno,
  listarAlumnos,
  buscarPorNumControl,
  actualizarAlumno,
  eliminarAlumno,
  asignarAlumnoAMateria
} from "../services/alumnosService";
import { listarMaterias } from "../services/materiasService";

export default function Alumnos() {
  const [form, setForm] = useState({ nombre:"", email:"", password:"", numControl:"", semestre:"" });
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  const onChange = (e)=> setForm(f=>({ ...f, [e.target.name]: e.target.value }));

  const load = async () => {
    try {
      setLoading(true);
      const A = await listarAlumnos();
      const M = await listarMaterias();
      setAlumnos(A.alumnos || []);
      const arr = M.clases || M.materias || [];
      setMaterias(arr.map(c => ({ id:c.id, nombre:`${c.nombre}${c.grupo?` (${c.grupo})`:""}` })));
    } catch(e) {
      Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error");
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const crear = async (e)=>{
    e.preventDefault();
    if(!form.nombre || !form.email || !form.password || !form.numControl || !form.semestre)
      return Swal.fire("Campos requeridos","Completa todos los campos","warning");
    try {
      const { alumno } = await crearAlumno({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        numControl: form.numControl.trim(),
        semestre: Number(form.semestre)
      });
      setAlumnos(a=>[alumno, ...a]);
      setForm({ nombre:"", email:"", password:"", numControl:"", semestre:"" });
      Swal.fire("Listo","Alumno creado","success");
    } catch(e){ Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error"); }
  };

  const buscar = async (e)=> {
    e.preventDefault();
    if(!q.trim()) return load();
    try {
      const { alumno } = await buscarPorNumControl(q.trim());
      setAlumnos([alumno]);
    } catch(e){
      Swal.fire("Sin resultados", e?.response?.data?.mensaje || "No encontrado", "info");
      setAlumnos([]);
    }
  };

  const abrirEdicion = (a)=> setEdit({ ...a });
  const guardarEdicion = async ()=>{
    try {
      const payload = {
        nombre: edit.nombre,
        email: edit.email,
        numControl: edit.numControl,
        semestre: Number(edit.semestre)
      };
      if (edit.password && String(edit.password).length >= 6) payload.password = edit.password;
      const { alumno } = await actualizarAlumno(edit.uid, payload);
      setAlumnos(list=>list.map(x=>x.uid===alumno.uid? alumno : x));
      setEdit(null);
      Swal.fire("Actualizado","Alumno editado","success");
    } catch(e){ Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error"); }
  };

  const borrar = async (a)=>{
    const ok = await Swal.fire({ title:"¿Eliminar alumno?", text:"Se eliminará también de sus materias.", icon:"warning", showCancelButton:true });
    if(!ok.isConfirmed) return;
    try {
      await eliminarAlumno(a.uid);
      setAlumnos(list=>list.filter(x=>x.uid!==a.uid));
      Swal.fire("Eliminado","Alumno eliminado","success");
    } catch(e){ Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error"); }
  };

  const asignar = async (alumnoUid, materiaId)=>{
    if(!materiaId) return;
    try {
      await asignarAlumnoAMateria(materiaId, { alumnoId: alumnoUid });
      Swal.fire("Asignado","Alumno agregado a la materia","success");
    } catch(e){ Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error"); }
  };

  return (
    <div style={{ maxWidth: 560, margin:"0 auto" }}>
      <h2 style={{margin:"12px 0"}}>👨‍🎓 Gestión de Alumnos</h2>

      {/* Registrar nuevo alumno (mismo patrón que Usuarios) */}
      <div className="card" style={card}>
        <h3 style={{margin:"0 0 8px"}}>➕ Registrar nuevo alumno</h3>
        <form onSubmit={crear} style={{display:"grid",gap:8}}>
          <input className="in" name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={onChange}/>
          <input className="in" name="email" type="email" placeholder="Correo" value={form.email} onChange={onChange}/>
          <input className="in" name="password" type="password" placeholder="Contraseña (mín. 6)" value={form.password} onChange={onChange}/>
          <input className="in" name="numControl" placeholder="Número de control" value={form.numControl} onChange={onChange}/>
          <input className="in" name="semestre" type="number" min="1" placeholder="Semestre" value={form.semestre} onChange={onChange}/>
          <button className="btn btn-primary">Crear Alumno</button>
        </form>
      </div>

      {/* Buscar */}
      <form onSubmit={buscar} style={{display:"flex",gap:8,margin:"8px 0"}}>
        <input className="in" placeholder="Buscar por número de control..." value={q} onChange={(e)=>setQ(e.target.value)}/>
        <button className="btn">Buscar</button>
        <button className="btn" type="button" onClick={load}>Reiniciar</button>
      </form>

      {/* Lista */}
      <div className="card" style={card}>
        {loading ? <p>Cargando…</p> : alumnos.length===0 ? <p>Sin alumnos</p> : (
          <ul style={{listStyle:"none",padding:0,margin:0}}>
            {alumnos.map(a=>(
              <li key={a.uid} style={item}>
                <div>
                  <div style={{fontWeight:700}}>{(a.nombre||"").toUpperCase()}</div>
                  <div style={{color:"#555"}}>{a.email}</div>
                  <div style={{marginTop:4,fontSize:12,color:"#666"}}>
                    <span style={pill}>Rol: alumno</span>
                    <span style={pill}>#Control: {a.numControl}</span>
                    <span style={pill}>Sem: {a.semestre}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {/* Asignar a materia */}
                  <select defaultValue="" onChange={(e)=> e.target.value && asignar(a.uid, e.target.value)} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #ddd"}}>
                    <option value="" disabled>Asignar a materia…</option>
                    {materias.map(m=> <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                  <button className="btn btn-blue" onClick={()=>setEdit({...a})}>✏️ Editar</button>
                  <button className="btn btn-danger" onClick={()=>borrar(a)}>🗑️ Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal simple de edición */}
      {edit && (
        <div style={modalBack}>
          <div style={modalCard}>
            <h3 style={{marginTop:0}}>Editar alumno</h3>
            <div style={{display:"grid",gap:8}}>
              <input className="in" value={edit.nombre} onChange={(e)=>setEdit(s=>({...s,nombre:e.target.value}))}/>
              <input className="in" value={edit.email} onChange={(e)=>setEdit(s=>({...s,email:e.target.value}))}/>
              <input className="in" value={edit.numControl} onChange={(e)=>setEdit(s=>({...s,numControl:e.target.value}))}/>
              <input className="in" type="number" value={edit.semestre} onChange={(e)=>setEdit(s=>({...s,semestre:e.target.value}))}/>
              <input className="in" type="password" placeholder="Nueva contraseña (opcional)" value={edit.password||""} onChange={(e)=>setEdit(s=>({...s,password:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
              <button className="btn" onClick={()=>setEdit(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .in{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;background:#f7f7f9}
        .btn{padding:10px 14px;border:none;border-radius:8px;background:#e5e7eb;cursor:pointer}
        .btn:hover{filter:brightness(.95)}
        .btn-primary{background:#2563eb;color:#fff}
        .btn-blue{background:#0ea5e9;color:#fff}
        .btn-danger{background:#ef4444;color:#fff}
      `}</style>
    </div>
  );
}

const card={background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 12px rgba(0,0,0,.06)",marginBottom:12};
const item={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 8px",border:"1px solid #eee",borderRadius:10,marginBottom:8,background:"#fafafa"};
const pill={padding:"2px 8px",background:"#eef2ff",borderRadius:12,marginRight:6};
const modalBack={position:"fixed",inset:0,background:"rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999};
const modalCard={background:"#fff",padding:16,borderRadius:12,width:"min(520px,92vw)",boxShadow:"0 10px 30px rgba(0,0,0,.2)"};

