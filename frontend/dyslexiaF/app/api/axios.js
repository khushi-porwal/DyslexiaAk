import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.43.25:5000",
  timeout: 10000,
});

export default API;
