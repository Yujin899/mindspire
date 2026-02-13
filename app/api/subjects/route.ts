export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subject from '@/lib/models/Subject';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        await connectToDatabase();
        const subjects = await Subject.find();
        return NextResponse.json(subjects);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded || (decoded as any).role !== 'admin') {
            return NextResponse.json({ message: 'Access denied. Thou art not a Dungeon Master!' }, { status: 403 });
        }

        const { name, description, icon } = await req.json();
        const subject = new Subject({ name, description, icon });
        await subject.save();

        return NextResponse.json(subject, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
