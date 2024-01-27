import bcrypt from "bcrypt";
import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { generateOtp } from "../utils/generateOtp.js";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullname, password } = await req.body;

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

const verifyOtp = asyncHandler(async (req, res) => {
  const { user, otp } = await req.body;

  if ([user, otp].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fileds are required");
  }

  const otpData = await Otp.findOne({ user: user }).sort({ createdAt: -1 });

  if (!otpData) {
    throw new ApiError(404, "OTP expired, please try again");
  }

  const isOtp = await bcrypt.compare(otp, otpData.otp);

  if (!isOtp) {
    throw new ApiError(404, "Please Enter Proper Otp..");
  }

  const updateUser = await User.findByIdAndUpdate(
    user,
    { verified: true },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Otp Verification Sucessfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = await req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.verified) {
    await generateOtp(user);
    throw new ApiError(401, "Please Verify User!!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req,res)=>{

})

const verifyUser = asyncHandler(async (req,res)=>{
  
})


export { registerUser, verifyOtp, loginUser,logout, verifyUser };
