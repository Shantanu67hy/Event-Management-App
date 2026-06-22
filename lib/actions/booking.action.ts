'use server';

import Booking from '@/database/booking.model';
import connectDB from '@/lib/mongodb';

export const createBooking = async ({
    eventId,
    slug,
    email,
}: {
    eventId: string;
    slug: string;
    email: string;
}) => {
    try {
        await connectDB();

        console.log('Creating booking:', {
            eventId,
            slug,
            email,
        });

        await Booking.create({
            eventId,
            email,
        });

        return {
            success: true,
        };
    } catch (e) {
        console.error('CREATE BOOKING ERROR:', e);

        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
};