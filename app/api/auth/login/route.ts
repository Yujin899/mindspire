export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { username, password } = await req.json();

        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: 'Invalid username or sword!' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid username or sword!' }, { status: 401 });
        }

        const token = signToken({ userId: user._id, role: user.role });

        const response = NextResponse.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                character: user.character
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

