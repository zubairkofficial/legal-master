// controllers/authController.js
import { User } from '../models/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import fs from 'fs';


dotenv.config();

class AuthController {

    static async sendConfirmationEmail(user) {
        const token = String(crypto.randomBytes(32).toString('hex')); // Generate a unique token
        const verificationUrl = `${process.env.BACKEND_API_URL}/auth/verify-email?token=${token}&email=${user.email}`;
        // Store the token in the user record for later verification (you might want to add a new field in your User model)
        user.verificationToken = token; // Make sure to update your User model to store this token
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.titan.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #121212;
        }
        .email-container {
            background-color: #1e1e1e;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            padding: 30px;
            text-align: center;
        }
        .email-header {
            background-color: #b71c1c;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px;
        }
        .verify-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #d32f2f;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }
        .verify-button:hover {
            background-color: #c62828;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
        a {
            color: #d32f2f;
            text-decoration: none;
        }
        a:hover {
            color: #b71c1c;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Clutch AI</h1>
        </div>
        
        <h2>Welcome Aboard!</h2>
        
        <p>Thank you for signing up for Clutch AI. To get started and secure your account, please verify your email address by clicking the button below.</p>
        
        <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
        
        <p>If you didn't create an account, you can safely ignore this email.</p>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Clutch AI. All rights reserved.</p>
            <p>If you're having trouble, copy and paste this link into your browser: <br>${verificationUrl}</p>
        </div>
    </div>
</body>
</html>
    `;

        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: user.email,
            subject: 'Verify Your Email - Clutch-AI',
            html: emailTemplate // Assuming you'll define the template as shown above
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Error sending email: ${error.message}`);
        }
    }

    static async signup(req, res) {
        const { name, email, password, username } = req.body;

        // Validate password length
        try {
            // Check if email already exists
            const existingUserByEmail = await User.findOne({ where: { email } });
            if (existingUserByEmail) {
                return res.status(400).json({ message: 'Email is already in use.' });
            }

            // Check if username already exists
            const existingUserByUsername = await User.findOne({ where: { username } });
            if (existingUserByUsername) {
                return res.status(400).json({ message: 'Username is already taken.' });
            }

            // Create the user
            const newUser = await User.create({
                name,
                email,
                username,
                password, // Assuming the User model has a hook to hash the password automatically
                role: 'user',
            });

            // Send confirmation email
            await AuthController.sendConfirmationEmail(newUser);

            // Send success response
            res.status(201).json({
                message: 'Signed up successfully. Please check your email for verification.',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    isActive: newUser.isActive,
                    role: newUser.role,
                },
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: `Internal server error: ${error.message}` });
        }
    }

    static async verifyEmail(req, res) {
        const { token, email } = req.query;

        try {
            // Find the user with the given email and token
            const user = await User.findOne({ where: { email, verificationToken: token } });

            if (!user) {
                return res.status(400).send(`
                    <html>
                    <head>
                        <title>Email Verification Failed</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                                background-color: #121212;
                                color: #e0e0e0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #1e1e1e;
                                padding: 2rem;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 400px;
                            }
                            .error-icon {
                                color: #d32f2f;
                                font-size: 48px;
                                margin-bottom: 1rem;
                            }
                            h1 {
                                color: #d32f2f;
                                margin-bottom: 1rem;
                            }
                            p {
                                margin-bottom: 1.5rem;
                                line-height: 1.5;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error-icon">❌</div>
                            <h1>Verification Failed</h1>
                            <p>Invalid or expired verification link. Please request a new verification email.</p>
                        </div>
                    </body>
                    </html>
                `);
            }


            await user.update(
                {
                    isActive: true,
                    verificationToken: null
                }
            )

            // Return success HTML page
            res.send(`
                <html>
                <head>
                    <title>Email Verified Successfully</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            background-color: #121212;
                            color: #e0e0e0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background-color: #1e1e1e;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        .success-icon {
                            color: #4caf50;
                            font-size: 48px;
                            margin-bottom: 1rem;
                        }
                        h1 {
                            color: #4caf50;
                            margin-bottom: 1rem;
                        }
                        p {
                            margin-bottom: 1.5rem;
                            line-height: 1.5;
                        }
                        .login-link {
                            color: #d32f2f;
                            text-decoration: none;
                            font-weight: bold;
                        }
                        .login-link:hover {
                            color: #b71c1c;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">✅</div>
                        <h1>Email Verified Successfully!</h1>
                        <p>Your account has been successfully verified. You can now log in to your account.</p>
                        <p class="login-link">You can now login to your account </p>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error verifying email:', error);
            res.status(500).send(`
                <html>
                <head>
                    <title>Server Error</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            background-color: #121212;
                            color: #e0e0e0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background-color: #1e1e1e;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        .error-icon {
                            color: #d32f2f;
                            font-size: 48px;
                            margin-bottom: 1rem;
                        }
                        h1 {
                            color: #d32f2f;
                            margin-bottom: 1rem;
                        }
                        p {
                            margin-bottom: 1.5rem;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error-icon">❌</div>
                        <h1>Server Error</h1>
                        <p>An error occurred while verifying your email. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
        }
    }

    static async signin(req, res) {
        const { username, email, password } = req.body;

        try {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: username }  // Using the username field to check against email too
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is not activated. Please verify your email.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate access token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            // Save refresh token to database
            await user.update({ refreshToken });

            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    isActive: user.isActive,
                    role: user.role,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                    profileImage: user.profileImage
                },
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Error signing in:', error);
            res.status(500).json({ message: `Internal server error: ${error.message}` });
        }
    }

    static async forgotPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetUrl = `${process.env.BACKEND_API_URL}/auth/reset-password?token=${resetToken}&email=${user.email}`;

            // Set token and expiry (1 hour)cd
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // Send email
            const transporter = nodemailer.createTransport({
                host: 'smtp.titan.email',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: 'Password Reset - Clutch AI',
                html: `
                    <div style="background-color: #1e1e1e; padding: 20px; color: #e0e0e0;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset. Click the link below to reset your password:</p>
                        <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>This link will expire in 1 hour.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Password reset email sent' });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ message: 'Error processing request' });
        }
    }

    static async resetPassword(req, res) {
        const { token, email, newPassword } = req.body;

        try {
            const user = await User.findOne({
                where: {
                    email,
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            // Update password and clear reset fields
            user.password = newPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            console.error('Error in resetPassword:', error);
            res.status(500).json({ message: 'Error resetting password' });
        }
    }

    static async resendVerification(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isActive) {
                return res.status(400).json({ message: 'Account is already verified' });
            }

            await AuthController.sendConfirmationEmail(user);
            res.status(200).json({ message: 'Verification email resent' });
        } catch (error) {
            console.error('Error in resendVerification:', error);
            res.status(500).json({ message: 'Error resending verification email' });
        }
    }

    static async changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Assuming you have user in req from JWT middleware

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Error in changePassword:', error);
            res.status(500).json({ message: 'Error changing password' });
        }
    }


    static async enable2FA(req, res) {
        const userId = req.user.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await user.update({ isTwoFactorEnabled: true });
            // Generate QR code URL

            res.status(200).json({
                message: '2FA setup initiated',

            });
        } catch (error) {
            console.error('Error in enable2FA:', error);
            res.status(500).json({ message: 'Error enabling 2FA' });
        }
    }

    static async send2FACode(req, res) {
        const userId = req.user.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

            // Save OTP to user record
            await user.update({
                otp: await bcrypt.hash(otp, 10),
                otpExpiry
            });

            // Send OTP via email
            const transporter = nodemailer.createTransport({
                host: 'smtp.titan.email',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: '2FA Code - Clutch AI',
                html: `
                <div style="background-color: #1e1e1e; padding: 20px; color: #e0e0e0;">
                    <h2>Your 2FA Code</h2>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
            };

            await transporter.sendMail(mailOptions);
            res.status(200).json({
                message: 'OTP sent successfully',
                expiresIn: 300 // 5 minutes in seconds
            });
        } catch (error) {
            console.error('Error sending 2FA code:', error);
            res.status(500).json({ message: 'Error sending 2FA code' });
        }
    }

    static async verify2FALogin(req, res) {
        const { email, otp } = req.body;

        try {
            const user = await User.findOne({
                where: {
                    email,
                    otpExpiry: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Verify OTP
            const isValidOTP = await bcrypt.compare(otp, user.otp);
            if (!isValidOTP) {
                return res.status(401).json({ message: 'Invalid OTP' });
            }

            // Clear OTP after successful verification
            await user.update({
                otp: null,
                otpExpiry: null
            });

            // Generate new tokens
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            await user.update({ refreshToken });

            res.status(200).json({
                message: '2FA verification successful',
                token,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    isActive: user.isActive,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error in verify2FALogin:', error);
            res.status(500).json({ message: 'Error verifying 2FA code' });
        }
    }

    static async resend2FACode(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

            // Update user with new OTP
            await user.update({
                otp: await bcrypt.hash(otp, 10),
                otpExpiry
            });

            // Send new OTP via email
            const transporter = nodemailer.createTransport({
                host: 'smtp.titan.email',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: 'New 2FA Code - Clutch AI',
                html: `
                <div style="background-color: #1e1e1e; padding: 20px; color: #e0e0e0;">
                    <h2>Your New 2FA Code</h2>
                    <p>Your new verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
            };

            await transporter.sendMail(mailOptions);
            res.status(200).json({
                message: 'New OTP sent successfully',
                expiresIn: 300 // 5 minutes in seconds
            });
        } catch (error) {
            console.error('Error resending 2FA code:', error);
            res.status(500).json({ message: 'Error resending 2FA code' });
        }
    }

    static async disable2FA(req, res) {
        const userId = req.user.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Disable 2FA
            user.twoFactorSecret = null;
            user.isTwoFactorEnabled = false;
            await user.save();

            res.status(200).json({ message: '2FA disabled successfully' });
        } catch (error) {
            console.error('Error in disable2FA:', error);
            res.status(500).json({ message: 'Error disabling 2FA' });
        }
    }

    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        try {
            // Verify the refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            // Find user
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate new access token
            const newToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({
                token: newToken
            });
        } catch (error) {
            console.error('Error refreshing token:', error);
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }

    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            // Find user with refresh token and clear it
            await User.update(
                { refreshToken: null },
                { where: { refreshToken } }
            );

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ message: 'Error logging out' });
        }
    }

    static async resetPasswordPage(req, res) {
        const { token, email } = req.query;

        try {
            // Check if token and email are valid
            const user = await User.findOne({
                where: {
                    email,
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) {
                return res.send(`
                    <html>
                    <head>
                        <title>Invalid Reset Link</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                                background-color: #121212;
                                color: #e0e0e0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #1e1e1e;
                                padding: 2rem;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 400px;
                            }
                            .error-icon {
                                color: #d32f2f;
                                font-size: 48px;
                                margin-bottom: 1rem;
                            }
                            h1 {
                                color: #d32f2f;
                                margin-bottom: 1rem;
                            }
                            p {
                                margin-bottom: 1.5rem;
                                line-height: 1.5;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error-icon">❌</div>
                            <h1>Invalid Reset Link</h1>
                            <p>This password reset link is invalid or has expired. Please request a new password reset.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            // If valid, show reset password form
            res.send(`
                <html>
                <head>
                    <title>Reset Password</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            background-color: #121212;
                            color: #e0e0e0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background-color: #1e1e1e;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            width: 100%;
                            max-width: 400px;
                        }
                        h1 {
                            color: #e0e0e0;
                            margin-bottom: 1.5rem;
                            text-align: center;
                        }
                        .form-group {
                            margin-bottom: 1rem;
                        }
                        label {
                            display: block;
                            margin-bottom: 0.5rem;
                            color: #a0a0a0;
                        }
                        input {
                            width: 100%;
                            padding: 0.75rem;
                            border: 1px solid #333;
                            border-radius: 4px;
                            background-color: #2d2d2d;
                            color: #e0e0e0;
                            margin-bottom: 0.5rem;
                        }
                        button {
                            width: 100%;
                            padding: 0.75rem;
                            background-color: #d32f2f;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1rem;
                        }
                        button:hover {
                            background-color: #b71c1c;
                        }
                        .error {
                            color: #d32f2f;
                            font-size: 0.875rem;
                            margin-top: 0.25rem;
                            display: none;
                        }
                        .success {
                            text-align: center;
                            color: #4caf50;
                            margin-top: 1rem;
                            display: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Reset Password</h1>
                        <form id="resetForm" onsubmit="return handleSubmit(event)">
                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    name="newPassword" 
                                    required 
                                    minlength="8"
                                />
                                <div class="error" id="passwordError"></div>
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    required
                                />
                                <div class="error" id="confirmError"></div>
                            </div>
                            <button type="submit">Reset Password</button>
                            <div class="success" id="successMessage">
                                Password reset successful! Please go back to Desktop app to continue.
                            </div>
                        </form>
                    </div>

                    <script>
                        async function handleSubmit(event) {
                            event.preventDefault();
                            
                            const newPassword = document.getElementById('newPassword').value;
                            const confirmPassword = document.getElementById('confirmPassword').value;
                            const passwordError = document.getElementById('passwordError');
                            const confirmError = document.getElementById('confirmError');
                            const successMessage = document.getElementById('successMessage');
                            
                            // Reset errors
                            passwordError.style.display = 'none';
                            confirmError.style.display = 'none';
                            
                            // Validate password
                            if (newPassword.length < 8) {
                                passwordError.textContent = 'Password must be at least 8 characters';
                                passwordError.style.display = 'block';
                                return false;
                            }
                            
                            // Check if passwords match
                            if (newPassword !== confirmPassword) {
                                confirmError.textContent = 'Passwords do not match';
                                confirmError.style.display = 'block';
                                return false;
                            }
                            
                            try {
                                const response = await fetch('${process.env.BACKEND_API_URL}/auth/reset-password', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        token: '${token}',
                                        email: '${email}',
                                        newPassword: newPassword
                                    })
                                });
                                
                                if (response.ok) {
                                    successMessage.style.display = 'block';
                                    setTimeout(() => {
                                        window.location.reload(); 
                                    }, 5000);
                                } else {
                                    const data = await response.json();
                                    passwordError.textContent = data.message || 'Failed to reset password';
                                    passwordError.style.display = 'block';
                                }
                            } catch (error) {
                                passwordError.textContent = 'An error occurred. Please try again.';
                                passwordError.style.display = 'block';
                            }
                            
                            return false;
                        }
                    </script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error in resetPasswordPage:', error);
            res.status(500).send(`
                <html>
                <head>
                    <title>Server Error</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            background-color: #121212;
                            color: #e0e0e0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background-color: #1e1e1e;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        .error-icon {
                            color: #d32f2f;
                            font-size: 48px;
                            margin-bottom: 1rem;
                        }
                        h1 {
                            color: #d32f2f;
                            margin-bottom: 1rem;
                        }
                        p {
                            margin-bottom: 1.5rem;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error-icon">❌</div>
                        <h1>Server Error</h1>
                        <p>An error occurred while processing your request. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
        }
    }

    static async updateProfile(req, res) {
        const userId = req.user.id;
        const { name, email, username, phone, profileImage } = req.body;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if email is being changed and if it's already in use
            if (email && email !== user.email) {
                const existingUserWithEmail = await User.findOne({ where: { email } });
                if (existingUserWithEmail) {
                    return res.status(400).json({ message: 'Email is already in use' });
                }
            }

            // Check if username is being changed and if it's already in use
            if (username && username !== user.username) {
                const existingUserWithUsername = await User.findOne({ where: { username } });
                if (existingUserWithUsername) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
            }

            // Prepare update data
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (username) updateData.username = username;
            if (phone) updateData.phone = phone;

            // Handle profile image if present
            if (profileImage) {
                // Extract the base64 data (remove data:image/xyz;base64, prefix)
                const base64Data = profileImage.split(';base64,').pop();
                
                // Generate unique filename
                const filename = `${Date.now()}-${userId}.png`;
                const filePath = `uploads/profiles/${filename}`;

                // Ensure directory exists
                if (!fs.existsSync('uploads/profiles')) {
                    fs.mkdirSync('uploads/profiles', { recursive: true });
                }

                // Save the file
                fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

                // Create the full URL for the profile image
                const imageUrl = `${process.env.BACKEND_BASE_URL}/${filePath}`;
                updateData.profileImage = imageUrl;
            }

            // Update user
            await user.update(updateData);

            // Return updated user data
            res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    role: user.role,
                    isTwoFactorEnabled: user.isTwoFactorEnabled
                }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: `Error updating profile: ${error.message}` });
        }
    }

    static async verifyPassword(req, res) {
        const userId = req.user.id;
        const { password } = req.body;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            
            res.status(200).json({
                isValid: isMatch,
                message: isMatch ? 'Password is valid' : 'Password is invalid'
            });
        } catch (error) {
            console.error('Error verifying password:', error);
            res.status(500).json({ message: 'Error verifying password' });
        }
    }
}

export default AuthController;