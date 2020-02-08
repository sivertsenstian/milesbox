import { IMeasurement, IBox } from "./";

export const measurement = {
  from: (dto: any): IMeasurement => ({
    timestamp: Number(dto.x),
    value: Number(dto.y)
  })
};

export const box = {
  from: (dto: any): IBox => ({
    id: Number(dto.boxId),
    name: dto.name
  })
};
