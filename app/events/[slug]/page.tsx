import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Promise type
}) => {
  return (
    <main>
      <Suspense fallback={<p>Loading event...</p>}>
        <EventDetails params={params} />
      </Suspense>
    </main>
  );
};

export default EventDetailsPage;