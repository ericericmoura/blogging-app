export const paginate = (perPage: number, currentPage: number): number => perPage * (currentPage - 1);

export const getTotalPages = (count: number, perPage: number): number => Math.ceil(count / perPage);