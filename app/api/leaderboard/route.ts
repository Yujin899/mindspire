export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const leaderboard = await User.find({ role: 'student' })
            .sort({ 'stats.totalXP': -1 })
            .limit(10)
            .select('username character stats.totalXP');

        return NextResponse.json(leaderboard);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}




