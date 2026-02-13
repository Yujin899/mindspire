export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded) {
            return NextResponse.json({ message: 'Thy token is missing, warrior!' }, { status: 401 });
        }

        const user = await User.findById((decoded as any).userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

