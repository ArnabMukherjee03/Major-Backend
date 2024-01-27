import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyOtp, registerUser, loginUser, logout, getCurrentUser} from "../controllers/user.contoller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/verifyotp").post(verifyOtp)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logout)
router.route("/current-user").get(verifyJWT, getCurrentUser)

export default router;