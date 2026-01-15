import api from "./axios";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", null, {
    params: {
      email,
      password,
    },
  });

  return res.data.token;
};
