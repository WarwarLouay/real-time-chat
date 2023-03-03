import axios from "axios";
import Constant from "./Constant";

class Request {
  constructor() {
    this.api = axios.create({
      baseURL: Constant.serverlink,
      timeout: Constant.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  debugit() {
    this.api.interceptors.request.use((request) => {
      console.log("Starting Request", request);
      return request;
    });

    this.api.interceptors.response.use((response) => {
      console.log("Response:", response);
      return response;
    });
  }

  async findChats(uid) {
    const link = "/api/chat/" + uid;
    return await this.api.get(link);
  }

  async get(path) {
    const link = "/api/" + path;
    return await this.api.get(link, path);
  }

  async createChat(data) {
    const link = "/api/chat";
    return await this.api.post(link, data);
  }

  async findMessages(chatId) {
    const link = "/api/message/" + chatId;
    return await this.api.get(link);
  }

  async sendMessage(data) {
    const link = "/api/message";
    return await this.api.post(link, data);
  }

  async addNotifications(data) {
    const link = "/api/notification";
    return await this.api.post(link, data);
  }

  async deleteNotifications(data) {
    const link = "/api/notification/delete";
    return await this.api.post(link, data);
  }

  async findLastMessage(chatId) {
    const link = "/api/lastmessage/" + chatId;
    return await this.api.get(link);
  }

  async verifyCode(data) {
    const link = "/api/user/verifycode";
    return await this.api.post(link, data);
  }

  async resendCode(data) {
    const link = "/api/user/resendcode";
    return await this.api.post(link, data);
  }

  async updateProfile(data) {
    const link = "/api/user/update";
    return await this.api.post(link, data);
  }
}

export default Request;
