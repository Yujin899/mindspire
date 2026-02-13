import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { username, password } = await req.json();

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ message: 'Username already taken thy warrior!' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();

        const token = signToken({ userId: newUser._id, role: newUser.role });

        const response = NextResponse.json({
            message: 'Thy account is created!',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                character: newUser.character
            }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        });

        return response;
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
