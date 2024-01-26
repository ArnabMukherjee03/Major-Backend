import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_MAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const sendMail = async ({email,subject,html} )=>{
   try {
    console.log(email);
    const info = await transporter.sendMail({
      from: '"Major-Backend" <Major-Backend.com>', 
      to: email, 
      subject: subject, 
      text: "", 
      html: html,
    });
    return info;
   } catch (error) {
     throw new ApiError(500,error.message);
   }
    
}