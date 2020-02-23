export interface IMeasurement {
  timestamp: number;
  value: number;
}

export interface IBox {
  id: number;
  owner: IUser;
  description: string;
}

export interface IUser {
  id: number;
  name: string;
}
