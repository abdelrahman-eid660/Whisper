export enum Gender {
  male,
  female,
}
export interface ILogin {
  email: string;
  password: string;
}
export interface ISignup extends ILogin {
  userName: string;
  confirmPassword: string;
  phone?: string;
  gender?: Gender;
  DOB?: Date;
}
export interface IConfirm {
  email: string;
  otp: string;
}
export interface IResetPassword extends ILogin{
    confirmPassword: string
}