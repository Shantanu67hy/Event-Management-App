"use client";

import { useState } from "react";
import { createBooking } from "../lib/actions/booking.action";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Submitting booking:", {
      eventId,
      slug,
      email,
    });

    const result = await createBooking({
      eventId,
      slug,
      email,
    });

    console.log("Booking Result:", result);

    if (result.success) {
      setSubmitted(true);

      if (result.success) {
        setSubmitted(true);

        posthog.capture("event_booked", {
          eventId,
          slug,
          email,
        });
      } else {
        console.error("Booking creation failed:", result.error);

        posthog.captureException(
          new Error(result.error || "Booking creation failed"),
        );
      }
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
            />
          </div>

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
