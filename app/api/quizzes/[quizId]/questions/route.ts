export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/lib/models/Question';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        await connectToDatabase();
        const { quizId } = await params;
        const questions = await Question.find({ quizId });
        return NextResponse.json(questions);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
