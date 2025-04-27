import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", 
  withCredentials: true, // for cookie auth
});

export default instance;
