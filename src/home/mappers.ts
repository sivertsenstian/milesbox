import { IMeasurement } from "./";

export const measurement = {
  from: (dto: any): IMeasurement => ({
    timestamp: Number(dto.t),
    value: Number(dto.v)
  })
};

export const box = {
  from: (dto: any): IBox => ({
    id: Number(dto.boxId),
    name: dto.name
  })
};
