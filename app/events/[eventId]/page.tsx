import { AuctionRoomClient } from "@/features/auction-room/AuctionRoomClient";
import { fallbackSnapshot, getAuctionSnapshot } from "@/features/auction-room/api";

type EventPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  let snapshot = fallbackSnapshot(eventId);

  try {
    snapshot = await getAuctionSnapshot(eventId);
  } catch {
    snapshot = fallbackSnapshot(eventId);
  }

  return <AuctionRoomClient initialSnapshot={snapshot} />;
}
