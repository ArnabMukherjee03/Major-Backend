import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyOtp, registerUser} from "../controllers/user.contoller.js";

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


export default router;