import { Otp } from "../models/otp.model.js";
import { ApiError } from "./ApiError.js";
import { sendMail } from "./mailService.js";

const generateOtp = async (user) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);

    if (!otp) {
      throw new ApiError(404, "Otp not created");
    }

    const email = user.email;
    const subject = "Your One-Time Verification Code for Account Security";
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gmail OTP Verification</title>
  </head>
  <body style="font-family: 'Arial', sans-serif; background-color: #f2f2f2; padding: 20px;">
  
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  
          <h2 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px;">Verify Your Email</h2>
  
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Dear ${user?.fullname},</p>
  
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">We've sent a one-time verification code to your email address. Please enter the code below:</p>
  
          <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">Your Verification Code:</p>
              <p style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;">${otp}</p>
          </div>

          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Enter the code in your application to complete the verification process.</p>
  
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">If you didn't request this code, please ignore this email.</p>
  
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Thank you,<br/>The Verification Team</p>
  
          <p style="font-size: 14px; color: #999;">This is an automated message. Please do not reply to this email.</p>
  
      </div>
  
  </body>
        </html>`;

    const info = await sendMail({ email, subject, html });

    if (!info) {
      throw new ApiError(500, "Something went wrong while sending Otp");
    }

    const newOtp = await Otp.create({
      user: user._id,
      otp,
    });

    const createdOtp = await Otp.findById(newOtp._id);

    if (!createdOtp) {
      throw new ApiError(500, "Something went wrong while saving Otp");
    }

    return createdOtp;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

export { generateOtp };
