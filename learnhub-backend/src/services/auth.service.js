// src/services/auth.service.js

const { users } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.loginService = async (email, password) => {
    try {
        console.log('Login input:', { email, password }); // Debug input
        const user = await users.findOne({ where: { email } });
        if (!user) {
            throw new Error('Email không tồn tại');
        }

        console.log('User found:', user); // Debug user data
        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            throw new Error('Mật khẩu không đúng');
        }

        // Kiểm tra trước khi tạo token
        if (!user.userid || !user.role) {
            throw new Error('Dữ liệu user không hợp lệ');
        }

        const token = jwt.sign(
            { id: user.userid, role: user.role },
            process.env.JWT_SECRET || 'default_secret', // Fallback nếu JWT_SECRET undefined
            { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: user.userid,
                email: user.email,
                full_name: user.fullname,
                role: user.role,
                profilepicture: user.profilepicture,
            },
        };
    } catch (error) {
        console.error('Login error:', error); // Debug lỗi
        throw error;
    }
};

exports.registerService = async (email, password, fullName, role = 'Student') => {
    try {
        console.log('Register input:', { email, password, fullName });
        const existingUser = await users.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email đã tồn tại');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await users.create({
            email,
            passwordhash: hashedPassword,
            fullname: fullName,
            role,
            profilepicture: null,
        });

        const token = jwt.sign(
            { id: user.userid, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: user.userid,
                email: user.email,
                full_name: user.fullname,
                role: user.role,
                profilepicture: user.profilepicture,
            },
        };
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};