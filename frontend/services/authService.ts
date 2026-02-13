import axios from "axios";

const API_URL = "http://localhost:5000/api/users/";

export const signup = (firstName: string, lastName: string, email: string, password: string) => {
  return axios.post(API_URL + "signup", {
    firstName,   
    lastName,
    email,
    password,
  });
};

export const signin = (email: string, password: string) => {
  return axios
    .post(API_URL + "signin", { 
        email,
        password,
    })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
        return response.data;
    });
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

export default {
    signup,
    signin,    
    logout,
    getCurrentUser, 
};