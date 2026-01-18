interface UserSocket{
    userId:string,
    socketId:string
}


const userSockets: Map<string,string> = new Map();

export const addUserSocket = (userId:string,socketId:string) =>{
    userSockets.set(userId,socketId);
}

export const removeUserSocket = (userId:string) => {
    userSockets.delete(userId);
}

export const getUserSocket = (userId:string):string | undefined => {
    return userSockets.get(userId);
}

export const getAllUsersSocket = ():UserSocket[] => {
    return Array.from(userSockets.entries()).map(([userId, socketId]) => ({
    userId,
    socketId
  }));
}