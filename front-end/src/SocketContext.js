import { createContext, useContext } from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:3000"); 
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);

export const useSocket = () => useContext(SocketContext);
