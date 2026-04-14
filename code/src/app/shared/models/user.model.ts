import { Gender } from "./auth.model";

export interface User {
  _id: string;
  userName: string; // backend field name
  email: string;
  displayName?: string;
  bio?: string;
  DOB?: Date | any;
  gender?: Gender | any;
  profilePicture?: {
    secure_url: string;
  };
  profileCover?: {
    secure_url: string;
  };
  confirmEmail: boolean;
  twoStepVerification: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  profileViews?: number;
  viewers?: any;
}

export interface PublicUser {
  _id: string;
  userName?: string;
  bio?: string;
  profilePicture?: string;
  profileCover?: string;
}

export interface IEditProfile {
  userName?: string;
  bio?: string;
  DOB?: Date;
  gender?: Gender;
}
export interface IUpdatePassword {
  oldPassword : string
  newPassword : string
  confirmPassword : string
}
