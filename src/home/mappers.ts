export const echo = {
  from: (dto: any) => ({
    id: dto.id,
    title: dto.title,
    user: { id: dto.userId },
    completed: dto.completed
  })
};
