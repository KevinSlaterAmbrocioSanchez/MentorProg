// frontend/src/pages/Alumnos.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Usa .env. Si tu backend NO usa /api, deja así:
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAT = import.meta.env.VITE_MATERIAS_PATH || "materias"; // pon "clases" si es /clases
const headers = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function Alumnos() {
  const [form, setForm] = useState({
    nombre: "",
    numControl: "",
    semestre: "",
    email: "",
    password: "",
  });

  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState("");
  const [asignarAlCrear, setAsignarAlCrear] = useState(true);

  const [q, setQ] = useState("");
  const [cargando, setCargando] = useState(true);
  const [edit, setEdit] = useState(null);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ------------ helpers API ------------
  const api = {
    crearAlumno: (payload) =>
      axios.post(`${API}/alumnos`, payload, { headers: headers() }).then((r) => r.data),
    listarAlumnos: () =>
      axios.get(`${API}/alumnos`, { headers: headers() }).then((r) => r.data),
    buscarPorNumControl: (numControl) =>
      axios.get(`${API}/alumnos/buscar`, { params: { numControl }, headers: headers() }).then((r) => r.data),
    actualizarAlumno: (uid, payload) =>
      axios.put(`${API}/alumnos/${uid}`, payload, { headers: headers() }).then((r) => r.data),
    eliminarAlumno: (uid) =>
      axios.delete(`${API}/alumnos/${uid}`, { headers: headers() }).then((r) => r.data),
    // materias: probamos varias rutas posibles
    listarMateriasRobusto: async () => {
      const rutas = [
        `${API}/${MAT}`,                      // /materias  o /clases
        `${API}/materias`,                    // fijo /materias
        `${API}/clases`,                      // fijo /clases
        `${API}/materias/listar`,             // variante común
      ];
      for (const url of rutas) {
        try {
          const { data } = await axios.get(url, { headers: headers() });
          // Normalizamos posibles formas
          const arr = data?.materias || data?.clases || data || [];
          if (Array.isArray(arr) && arr.length) {
            return arr.map((m) => ({
              id: m.id || m.uid || m.codigo || m.docId, // tolerancia
              nombre: `${m.nombre || m.titulo || m.asignatura}${m.grupo ? ` (${m.grupo})` : ""}`,
            }));
          }
        } catch (e) {
          // seguimos intentando con la siguiente ruta
          console.warn("No respondió:", url, e?.response?.status, e?.response?.data);
        }
      }
      return [];
    },
    asignarAlumnoAMateria: (materiaId, body) =>
      axios.post(`${API}/${MAT}/${materiaId}/alumnos`, body, { headers: headers() }).then((r) => r.data),
  };

  // ------------ carga inicial ------------
  const cargar = async () => {
    try {
      setCargando(true);

      // alumnos
      try {
        const A = await api.listarAlumnos();
        setAlumnos(A.alumnos || A || []);
      } catch (e) {
        const msg = e?.response?.data?.mensaje || e.message || "Error al listar alumnos";
        const st = e?.response?.status;
        Swal.fire("Error", `Error al listar alumnos (status ${st ?? "?"}). ${msg}`, "error");
        console.error("GET /alumnos falló:", st, e?.config?.url, e?.response?.data);
      }

      // materias
      const mats = await api.listarMateriasRobusto();
      setMaterias(mats);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------ acciones ------------
  const crear = async (e) => {
  e.preventDefault();
  const { nombre, numControl, semestre, email, password } = form;

  if (!nombre || !numControl || !semestre || !email || !password) {
    return Swal.fire("Campos requeridos", "Completa todos los campos.", "warning");
  }
  if (String(password).length < 6) {
    return Swal.fire("Contraseña muy corta", "Usa mínimo 6 caracteres.", "warning");
  }
  if (!email.includes("@") || !email.includes(".")) {
    return Swal.fire("Correo inválido", "Revisa el formato del correo.", "warning");
  }

  try {
    const { alumno } = await api.crearAlumno({
      nombre: nombre.trim(),
      numControl: numControl.trim(),
      semestre: Number(semestre),
      email: email.trim(),
      password,
    });

    /*if (asignarAlCrear && materiaId) {
      await api.asignarAlumnoAMateria(materiaId, { alumnoId: alumno.uid || alumno.id });
    }*/

    setAlumnos((list) => [alumno, ...list]);
    setForm({ nombre: "", numControl: "", semestre: "", email: "", password: "" });
    setMateriaId("");
    Swal.fire("Listo", "Alumno creado correctamente", "success");
  } catch (e) {
    // Network Error = axios no alcanzó al servidor (servidor caído, CORS, crash)
    if (e.message === "Network Error") {
      return Swal.fire("Error", "Network Error: el servidor no responde. Verifica que el backend esté corriendo en VITE_API_URL.", "error");
    }
    const msg = e?.response?.data?.mensaje || e.message;
    const code = e?.response?.data?.code || e?.code;
    const detalle = e?.response?.data?.detalle;
    Swal.fire("Error", `${msg}${code ? ` (${code})` : ""}${detalle ? `: ${detalle}` : ""}`, "error");
  }
};


  const buscar = async (e) => {
    e.preventDefault();
    if (!q.trim()) return cargar();
    try {
      const { alumno } = await api.buscarPorNumControl(q.trim());
      setAlumnos([alumno]);
    } catch (e) {
      Swal.fire("Sin resultados", e?.response?.data?.mensaje || "No encontrado", "info");
      setAlumnos([]);
    }
  };

  const borrar = async (a) => {
    const ok = await Swal.fire({
      title: "¿Eliminar alumno?",
      text: "Se eliminará también de sus materias.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.eliminarAlumno(a.uid || a.id);
      setAlumnos((l) => l.filter((x) => (x.uid || x.id) !== (a.uid || a.id)));
      Swal.fire("Eliminado", "Alumno eliminado", "success");
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error");
    }
  };

  const guardarEdicion = async () => {
    try {
      const payload = {
        nombre: edit.nombre,
        numControl: edit.numControl,
        semestre: Number(edit.semestre),
        email: edit.email,
      };
      if (edit.password && String(edit.password).length >= 6) payload.password = edit.password;
      const { alumno } = await api.actualizarAlumno(edit.uid || edit.id, payload);
      setAlumnos((l) =>
        l.map((x) => ((x.uid || x.id) === (alumno.uid || alumno.id) ? alumno : x))
      );
      setEdit(null);
      Swal.fire("Actualizado", "Alumno editado", "success");
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error");
    }
  };

  const asignar = async (alumnoUid, materiaId) => {
    if (!materiaId) return;
    try {
      await api.asignarAlumnoAMateria(materiaId, { alumnoId: alumnoUid });
      Swal.fire("Asignado", "Alumno agregado a la materia", "success");
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.mensaje || e.message, "error");
    }
  };

  const materiasOpts = useMemo(() => materias, [materias]);

  // ------------ UI ------------
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>👨‍🎓 Gestión de Alumnos</h2>
      <p style={{ marginTop: 0, color: "#444" }}>
        Crea alumnos con <b>nombre, número de control, semestre, correo y contraseña</b> y asígnalos a una materia.
      </p>

      {/* Formulario */}
      <div className="card" style={card}>
        <h3 style={{ margin: "0 0 8px" }}>➕ Registrar nuevo alumno</h3>

        <form onSubmit={crear} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label>Nombre</label>
            <input
              className="in"
              name="nombre"
              autoComplete="off"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={onChange}
              style={inStyle}
            />
          </div>

          <div>
            <label>Número de control</label>
            <input
              className="in"
              name="numControl"
              autoComplete="off"
              placeholder="Ej: ISC-2025-010"
              value={form.numControl}
              onChange={onChange}
              style={inStyle}
            />
          </div>

          <div>
            <label>Semestre</label>
            <input
              className="in"
              name="semestre"
              type="number"
              min="1"
              autoComplete="off"
              placeholder="Semestre"
              value={form.semestre}
              onChange={onChange}
              style={inStyle}
            />
          </div>

          <div>
            <label>Correo</label>
            <input
              className="in"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="alumno@correo.com"
              value={form.email}
              onChange={onChange}
              style={inStyle}
            />
          </div>

          <div>
            <label>Contraseña</label>
            <input
              className="in"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={onChange}
              style={inStyle}
            />
          </div>

          <div>
            <label>Rol</label>
            <input className="in" value="alumno" disabled style={{ ...inStyle, background: "#f1f5f9", color: "#555" }} />
          </div>

          <div>
            <label>Asignar a materia (opcional)</label>
            <select
              className="in"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              style={{ ...inStyle, color: materiaId ? "#111" : "#6b7280" }}
            >
              <option value="">— Selecciona materia —</option>
              {materiasOpts.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 13 }}>
              <input type="checkbox" checked={asignarAlCrear} onChange={(e) => setAsignarAlCrear(e.target.checked)} />
              Asignar automáticamente al crear
            </label>

            {materiasOpts.length === 0 && (
              <button type="button" className="btn" onClick={cargar} style={{ marginTop: 8 }}>
                ↻ Recargar materias
              </button>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary">Crear Alumno</button>
          </div>
        </form>
      </div>

      {/* Buscar */}
      <form onSubmit={buscar} style={{ display: "flex", gap: 8, margin: "8px 0" }}>
        <input
          className="in"
          placeholder="Buscar por número de control..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={inStyle}
        />
        <button className="btn">Buscar</button>
        <button className="btn" type="button" onClick={cargar}>
          Reiniciar
        </button>
      </form>

      {/* Lista */}
      <div className="card" style={card}>
        {cargando ? (
          <p>Cargando…</p>
        ) : alumnos.length === 0 ? (
          <p>No hay alumnos</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}># Control</th>
                <th style={th}>Sem</th>
                <th style={th}>Correo</th>
                <th style={th}>Asignar a materia</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.uid || a.id}>
                  <td style={td}>{a.nombre}</td>
                  <td style={td}>{a.numControl}</td>
                  <td style={{ ...td, textAlign: "center" }}>{a.semestre}</td>
                  <td style={td}>{a.email}</td>
                  <td style={td}>
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && asignar(a.uid || a.id, e.target.value)}
                      className="in"
                      style={inStyle}
                    >
                      <option value="" disabled>
                        Selecciona materia…
                      </option>
                      {materiasOpts.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-blue" onClick={() => setEdit({ ...a })}>
                        Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => borrar(a)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal edición */}
      {edit && (
        <div style={modalBack}>
          <div style={modalCard}>
            <h3 style={{ marginTop: 0 }}>Editar alumno</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <input className="in" value={edit.nombre} onChange={(e) => setEdit((s) => ({ ...s, nombre: e.target.value }))} placeholder="Nombre" style={inStyle} />
              <input className="in" value={edit.email} onChange={(e) => setEdit((s) => ({ ...s, email: e.target.value }))} placeholder="Correo" style={inStyle} />
              <input className="in" value={edit.numControl} onChange={(e) => setEdit((s) => ({ ...s, numControl: e.target.value }))} placeholder="Número de control" style={inStyle} />
              <input className="in" type="number" value={edit.semestre} onChange={(e) => setEdit((s) => ({ ...s, semestre: e.target.value }))} placeholder="Semestre" style={inStyle} />
              <input className="in" type="password" value={edit.password || ""} onChange={(e) => setEdit((s) => ({ ...s, password: e.target.value }))} placeholder="Nueva contraseña (opcional)" style={inStyle} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setEdit(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn{padding:10px 14px;border:none;border-radius:8px;background:#e5e7eb;cursor:pointer}
        .btn:hover{filter:brightness(.95)}
        .btn-primary{background:#2563eb;color:#fff}
        .btn-blue{background:#0ea5e9;color:#fff}
        .btn-danger{background:#ef4444;color:#fff}
      `}</style>
    </div>
  );
}

// estilos base
const inStyle = { width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#111" };
const card = { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 12 };
const th = { textAlign: "left", background: "#f8fafc", padding: 8, borderBottom: "1px solid #eee" };
const td = { padding: 8, borderBottom: "1px solid #f1f5f9" };
const modalBack = { position: "fixed", inset: 0, background: "rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalCard = { background: "#fff", padding: 16, borderRadius: 12, width: "min(520px,92vw)", boxShadow: "0 10px 30px rgba(0,0,0,.2)" };
