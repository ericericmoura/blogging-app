import multer from "multer";

const storage = multer.memoryStorage();
export const uploadMiddleware = (maxFileSizeMb: number) => multer({ storage, limits: {fileSize: maxFileSizeMb }});
