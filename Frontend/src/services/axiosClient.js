import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/unified_campus",
  withCredentials: true,
});

export default axiosClient;