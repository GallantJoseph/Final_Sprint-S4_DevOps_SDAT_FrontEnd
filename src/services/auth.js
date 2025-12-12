// this is for admin log in 
const ADMIN_PASSWORD = "password"; // change if we want

export const login = (password) => {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "true");
    return true;
  }
  return false;
};

export const logout = () => localStorage.removeItem("isAdmin");

export const isAdmin = () => localStorage.getItem("isAdmin") === "true";