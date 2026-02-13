export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';
import { getAuthUser } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        await connectToDatabase();
        const { subjectId } = await params;
        const quizzes = await Quiz.find({ subjectId });
        return NextResponse.json(quizzes);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded || (decoded as any).role !== 'admin') {
            return NextResponse.json({ message: 'Access denied. Thou art not a Dungeon Master!' }, { status: 403 });
        }

        const { subjectId } = await params;
        const { title, difficulty } = await req.json();
        const quiz = new Quiz({ subjectId, title, difficulty });
        await quiz.save();

        return NextResponse.json(quiz, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
