// const express = require("express");

// const {
//   createUser,
//   getAllUsers,
//   getUser,
//   deleteSpecificUser,
//   updateUser,
//   searchForUSer,
//   uploadUserImage,
//   resizeImage,
//   changeUserPassword,
// } = require("../controller/userServices");
// const {
//   createUserValidator,
//   getUserValidator,
//   updateUserValidator,
//   deleteUserValidator,
//   changeUserPasswordValidator
  
// } = require("../utils/validators/userValidator");

// const router = express.Router();
// router.put("/changePassword/:id",changeUserPasswordValidator,changeUserPassword);

// router
//   .route("/")
//   .post(uploadUserImage, resizeImage, createUserValidator, createUser)

//   .get(getAllUsers);

// router
//   .route("/:id")
//   .get(getUserValidator, getUser)
//   .put(updateUserValidator, updateUser)
//   .delete(deleteUserValidator, deleteSpecificUser);

// router.route("/search/:keyword").get(searchForUSer);

// module.exports = router;
