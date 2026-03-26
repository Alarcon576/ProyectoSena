const URL = "http://localhost:3000/api/mascotas";

// GET
export const getMascotas = async () => {
  const res = await fetch(URL);
  return await res.json();
};

// POST
export const createMascota = async (data) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
};

// PUT
export const updateMascota = async (id, data) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
};

// DELETE
export const deleteMascota = async (id) => {
  const res = await fetch(`${URL}/${id}`, {
    method: "DELETE"
  });
  return await res.json();
};