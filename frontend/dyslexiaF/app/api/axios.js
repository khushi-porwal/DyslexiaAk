import axios from "axios";
import { getBackendUrl } from "../../constants/api";

const API = axios.create({
  baseURL: getBackendUrl(),
  timeout: 10000,
});

export default API;
