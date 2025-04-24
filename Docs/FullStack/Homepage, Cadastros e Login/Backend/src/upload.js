import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // pasta temporária local
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, nomeArquivo);
    }
});

export const upload = multer({ storage });
