export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import Quiz from '@/lib/models/Quiz';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded || (decoded as any).role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { quizId, questions } = await req.json();

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        const formattedQuestions = questions.map((q: any) => ({
            quizId,
            content: q.content,
            options: q.options,
            basePoints: q.basePoints || 10,
            explanation: q.explanation || ""
        }));

        const inserted = await Question.insertMany(formattedQuestions);
        return NextResponse.json({ count: inserted.length, questions: inserted }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}




