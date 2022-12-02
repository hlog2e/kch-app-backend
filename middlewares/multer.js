const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")
const uuid = require("uuid")

const s3 = new aws.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
    signatureVersion: 'v4',
});

const storage = multerS3({
    s3: s3,
    bucket: 'kch-app',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', // 버킷에서 acl 관련 설정을 풀어줘야 사용할 수 있다.
    metadata: function(req, file, cb) {
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        cb(null, uuid.v4());
    }
})

const uploader = multer({
    storage: storage
})

module.exports = uploader