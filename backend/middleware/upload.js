import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.fieldname === 'degreeCertificate' ||
      file.fieldname === 'medicalRegistrationCertificate' ||
      file.fieldname === 'additionalQualificationCertificate'
    ) {
      cb(null, 'uploads/secure/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, PNG, or WEBP files are allowed!'));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
