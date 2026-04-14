export interface Message {
  _id: string;
  content: string;
  sender?: string | null;
  receiver?: {
    _id : string
    userName: string;
    profilePicture?:string
  };
  receiverId?:{
    _id : string
    userName: string;
    profilePicture:string
  };
  attachments?: string[] | any[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  direction?: "sent" | "received";
}

export interface SendMessagePayload {
  content: string;
  attachments?: File[];
}
