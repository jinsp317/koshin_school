export enum Sex {
  MALE = 0,
  FEMALE = 1
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female"
}
export enum CertKind {
  IDENTITY = 0,
  HOSPITALCARD = 1,
  PHONENUMBER = 2
}
export enum SYN_KIND {
  SYNCHRONIZE = 1,
  UNSYNCHRONIZE = 0,
}

export enum MANAGE_KIND {
  ADD = -1,
  MODIFY = 1,
  DEL = 2,
  IN = 3, // 入院
  OUT = 4, // 出院
  FULL_DEL = 5
}
export enum UNIQUE_KIND {
  MOBILE = 1,
  HOSPITAL_PAPER = 2,
  HOSPITAL_NUM = 4,
}
export enum Http_Error {
  Server_Error = 500,
  Authority_Error = 401,
  Authority_Password_Error = 402,
  Authority_Invalid_User_Error = 403,
  Other_Error = 300,
}
