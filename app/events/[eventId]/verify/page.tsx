import { VerifyBidderClient } from "@/features/auction-room/VerifyBidderClient";

type VerifyPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { eventId } = await params;
  return <VerifyBidderClient eventId={eventId} />;
}
