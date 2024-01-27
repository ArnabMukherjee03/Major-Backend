import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyOtp, registerUser, loginUser} from "../controllers/user.contoller.js";

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

export default router;