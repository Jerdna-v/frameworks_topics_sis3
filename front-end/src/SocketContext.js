import { createContext, useContext } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./Utils/Configuration";

export const socket = io(API_URL);
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);

export const useSocket = () => useContext(SocketContext);
