export const register = (data) => {
  return fetch("https://proyectosena-production-4ad5.up.railway.app/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
};

export const login = (data) => {
  return fetch("https://proyectosena-production-4ad5.up.railway.app/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
};