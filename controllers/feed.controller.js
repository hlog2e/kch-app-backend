module.exports = {
    uploadSingleFileToS3:(req,res)=> res.json({status:200,message:"정상적으로 업로드 되었습니다.",fileName:req.file.key})
}