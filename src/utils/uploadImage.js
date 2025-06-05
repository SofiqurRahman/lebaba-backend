const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dns412egp', 
  api_key: '975816565646863', 
  api_secret: 'Cp3kHot6kY2mwNhmly2jPiKlkNc'
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

// module.exports = (image) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (error, result) => {
      
//       if(result && result.secure_url) {
//         return resolve(result.secure_url)
//       }
//       console.log(error.message)
//       return reject({message: error.message})
//     })
//   })
// }

const uploadImage = async (image) => {
  try {
    const result = await cloudinary.uploader.upload(image, opts);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw new Error(error.message);
  }
};

module.exports = uploadImage;