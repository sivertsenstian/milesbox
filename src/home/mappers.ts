import { IMeasurement } from "./";

export const measurement = {
  from: (dto: any): IMeasurement => ({
    timestamp: Number(dto.t),
    value: Number(dto.v)
  })
};
