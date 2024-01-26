import bcrypt from "bcrypt";
import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/mailService.js";


const registerUser = asyncHandler(async (req, res) => {
  const { email, username,fullname, password } = await req.body;

  if (
    [email, username, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fileds are required");
  }

  const regex_pwd =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-=_+{}[\]:;<>,.?/~]).{8,24}$/;

  if (!regex_pwd.test(password)) {
    throw new ApiError(400, "Please Use a strong Password");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatarLocalPath, 
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  await generateOtp(createdUser);

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const verifyOtp = asyncHandler(async (req,res)=>{
  const {user,otp} = await req.body;

  if (
    [user,otp].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fileds are required");
  }


  const otpData = await Otp.findOne({user:user});

  if(!otpData){
    throw new ApiError(404,"OTP expired, please try again")
  }

  const isOtp =  await bcrypt.compare(otp, otpData.otp);

  if(!isOtp){
    throw new ApiError(404,"Please Enter Proper Otp..")
  }

  const updateUser = await User.findByIdAndUpdate(user,{verified: true},{new: true});
 


  return res
  .status(201)
  .json(new ApiResponse(200,{}, "Otp Verification Sucessfully"));
})




export {registerUser,verifyOtp};