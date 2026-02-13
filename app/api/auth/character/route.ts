import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { character } = await req.json();
        const user = await User.findById((decoded as any).userId);

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        user.character = character;
        await user.save();

        return NextResponse.json({ message: 'Character chosen!', user: { character: user.character } });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
