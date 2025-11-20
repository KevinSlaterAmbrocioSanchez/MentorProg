import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const h = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const crearAlumno = (payload) =>
  axios.post(`${API}/alumnos`, payload, { headers: h() }).then((r) => r.data);

export const listarAlumnos = () =>
  axios.get(`${API}/alumnos`, { headers: h() }).then((r) => r.data);

export const buscarPorNumControl = (numControl) =>
  axios.get(`${API}/alumnos/buscar`, { params: { numControl }, headers: h() }).then((r) => r.data);

export const actualizarAlumno = (uid, payload) =>
  axios.put(`${API}/alumnos/${uid}`, payload, { headers: h() }).then((r) => r.data);

export const eliminarAlumno = (uid) =>
  axios.delete(`${API}/alumnos/${uid}`, { headers: h() }).then((r) => r.data);

// 👇 usa /materias por defecto; si tu endpoint es /clases, cambia VITE_MATERIAS_PATH
const MAT = import.meta.env.VITE_MATERIAS_PATH || "materias";
export const asignarAlumnoAMateria = (materiaId, body) =>
  axios.post(`${API}/${MAT}/${materiaId}/alumnos`, body, { headers: h() }).then((r) => r.data);
