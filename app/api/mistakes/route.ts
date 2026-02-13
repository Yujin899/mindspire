export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Attempt from '@/lib/models/Attempt';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const quizId = searchParams.get('quizId');
        const userId = (decoded as any).userId;

        const pipeline: any[] = [
            { $match: { userId: new mongoose.Types.ObjectId(userId), isCorrect: false } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' }
        ];

        if (quizId) {
            pipeline.push({
                $match: { 'question.quizId': new mongoose.Types.ObjectId(quizId) }
            });
        }

        if (subjectId) {
            pipeline.push({
                $lookup: {
                    from: 'quizzes',
                    localField: 'question.quizId',
                    foreignField: '_id',
                    as: 'quiz'
                }
            },
                { $unwind: '$quiz' },
                {
                    $match: { 'quiz.subjectId': new mongoose.Types.ObjectId(subjectId) }
                });
        }

        const mistakes = await Attempt.aggregate(pipeline);

        const uniqueMistakes: any[] = [];
        const seen = new Set();

        for (const attempt of mistakes) {
            if (!attempt.question) continue;

            const qId = attempt.question._id.toString();
            if (!seen.has(qId)) {
                seen.add(qId);
                uniqueMistakes.push({
                    ...attempt.question,
                    userChoiceId: attempt.choiceId || null
                });
            }
        }

        return NextResponse.json(uniqueMistakes);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}




