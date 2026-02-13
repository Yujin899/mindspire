export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import User from '@/lib/models/User';
import Attempt from '@/lib/models/Attempt';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const decoded = await getAuthUser();

        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { questionId, choiceId, sessionId } = await req.json();
        const userId = (decoded as any).userId;

        if (!sessionId) {
            return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
        }

        // 1. Fetch Question and User
        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check for duplicate submission in this session to prevent XP double-counting
        const existingAttempt = await Attempt.findOne({ userId, questionId, sessionId });

        // 2. Check correctness
        const selectedOption = question.options.find((opt: any) => opt.id === choiceId);
        if (!selectedOption) {
            return NextResponse.json({ message: 'Invalid choice' }, { status: 400 });
        }
        const isCorrect = selectedOption.isCorrect;

        // 3. Logic for Streak and XP
        let xpGained = 0;
        let newStreak = user.stats.currentStreak;
        const now = new Date();
        const lastAttemptDate = user.stats.lastAttemptDate;

        const shouldGrantXP = isCorrect && !existingAttempt;

        if (isCorrect) {
            if (lastAttemptDate) {
                const hoursSinceLast = (now.getTime() - new Date(lastAttemptDate).getTime()) / (1000 * 60 * 60);
                if (hoursSinceLast > 24) {
                    newStreak = 1;
                } else {
                    newStreak += 1;
                }
            } else {
                newStreak = 1;
            }

            if (shouldGrantXP) {
                const multiplier = Math.min(2.0, 1 + ((newStreak - 1) * 0.1));
                xpGained = Math.floor(question.basePoints * multiplier);
            }
        } else {
            newStreak = 0;
        }

        // 4. Record Attempt
        await Attempt.create({
            userId,
            questionId,
            sessionId,
            isCorrect,
            choiceId
        });

        // 5. Update User Stats
        user.stats.totalXP += xpGained;
        user.stats.currentStreak = newStreak;
        user.stats.lastAttemptDate = now;
        await user.save();

        return NextResponse.json({
            isCorrect,
            correctChoiceId: question.options.find((opt: any) => opt.isCorrect).id,
            xpGained,
            newStreak,
            multiplier: isCorrect ? Math.min(2.0, 1 + ((newStreak - 1) * 0.1)) : 1.0,
            stats: {
                totalXP: user.stats.totalXP,
                userLeague: "Bronze"
            }
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

